const LOCAL_URL = (process.env.WP_LOCAL_URL ?? "http://kotlinskidev.local").replace(/\/$/, "");
const PROD_URL = (process.env.WP_PROD_URL ?? "https://kotlinskidev.com").replace(/\/$/, "");

const MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  glb: "model/gltf-binary",
  pdf: "application/pdf",
};

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--") && !a.includes("=")));
const options = Object.fromEntries(
  args.filter((a) => a.startsWith("--") && a.includes("=")).map((a) => a.slice(2).split("="))
);
const slug = args.find((a) => !a.startsWith("--"));
const type = options.type ?? "pages";
const dryRun = flags.has("--dry-run");
const publish = flags.has("--publish");

const log = (message) => process.stdout.write(`${message}\n`);

const fail = (message) => {
  console.error(`push-page: ${message}`);
  process.exit(1);
};

const required = ["WP_LOCAL_USER", "WP_LOCAL_APP_PASSWORD", "WP_PROD_USER", "WP_PROD_APP_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (!slug) fail("usage: npm run push-page -- <slug> [--publish] [--dry-run] [--type=posts]");
if (missing.length) fail(`missing env: ${missing.join(", ")}`);

const site = (baseUrl, user, password) => ({
  baseUrl,
  authorization: `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`,
});
const local = site(LOCAL_URL, process.env.WP_LOCAL_USER, process.env.WP_LOCAL_APP_PASSWORD);
const prod = site(PROD_URL, process.env.WP_PROD_USER, process.env.WP_PROD_APP_PASSWORD);

const request = async (target, path, { method = "GET", headers = {}, body } = {}) => {
  const response = await fetch(`${target.baseUrl}/wp-json/wp/v2${path}`, {
    method,
    headers: { Authorization: target.authorization, ...headers },
    body,
  });
  const text = await response.text();
  if (!response.ok)
    fail(`${method} ${target.baseUrl}${path} -> ${response.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
};

const sendJson = (target, path, method, payload) =>
  request(target, path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const uploadsPrefix = `${LOCAL_URL}/wp-content/uploads/`;
const stripSize = (rel) => rel.replace(/-\d+x\d+(?=\.\w+$)/, "");
const baseName = (value) => value.split("/").pop();

const findLocalMedia = async (id) => {
  const response = await fetch(`${LOCAL_URL}/wp-json/wp/v2/media/${id}?context=edit`, {
    headers: { Authorization: local.authorization },
  });
  return response.ok ? response.json() : null;
};

const collectMediaIds = (content, featuredId) => {
  const ids = new Set(featuredId ? [featuredId] : []);
  for (const match of content.matchAll(
    /wp-image-(\d+)|data-id="(\d+)"|"[A-Za-z]*(?:Id|ID|id)"\s*:\s*(\d+)/g
  )) {
    ids.add(Number(match[1] ?? match[2] ?? match[3]));
  }
  for (const match of content.matchAll(/"ids"\s*:\s*\[([\d,\s]+)\]/g)) {
    match[1].split(",").forEach((id) => ids.add(Number(id.trim())));
  }
  ids.delete(0);
  return ids;
};

const findProdMedia = async (searchTerm, fileName) => {
  const results = await request(
    prod,
    `/media?search=${encodeURIComponent(searchTerm)}&per_page=50&context=edit`
  );
  return results.find((item) => baseName(item.source_url) === fileName) ?? null;
};

const uploadToProd = async (rel, info) => {
  const fileName = baseName(rel);
  const searchTerm = info?.title?.raw || fileName.replace(/\.\w+$/, "");
  const existing = await findProdMedia(searchTerm, fileName);
  if (existing) return { media: existing, reused: true };
  if (dryRun)
    return {
      media: { id: 0, source_url: `${PROD_URL}/(new)/${fileName}`, media_details: {} },
      reused: false,
    };
  const download = await fetch(`${uploadsPrefix}${rel}`);
  if (!download.ok) fail(`download failed ${uploadsPrefix}${rel} -> ${download.status}`);
  const extension = fileName.split(".").pop().toLowerCase();
  const created = await request(prod, "/media", {
    method: "POST",
    headers: {
      "Content-Type": MIME[extension] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
    body: Buffer.from(await download.arrayBuffer()),
  });
  if (info) {
    await sendJson(prod, `/media/${created.id}`, "POST", {
      title: info.title?.raw,
      alt_text: info.alt_text,
      caption: info.caption?.raw,
      description: info.description?.raw,
    });
  }
  return { media: created, reused: false };
};

const [page] = await request(
  local,
  `/${type}?slug=${encodeURIComponent(slug)}&status=any&context=edit`
);
if (!page) fail(`no ${type} with slug "${slug}" on ${LOCAL_URL}`);

const content = page.content.raw;
const mediaIds = collectMediaIds(content, page.featured_media);
const localMedia = new Map();
for (const id of mediaIds) {
  const media = await findLocalMedia(id);
  if (media) localMedia.set(id, media);
}

const originals = new Map();
const relOf = (url) => url.slice(uploadsPrefix.length);
for (const match of content.matchAll(
  new RegExp(`${escapeRegex(uploadsPrefix)}[^"'\\s)\\\\<>]+`, "g")
)) {
  originals.set(stripSize(relOf(match[0])), null);
}
for (const media of localMedia.values()) {
  if (media.source_url.startsWith(uploadsPrefix))
    originals.set(stripSize(relOf(media.source_url)), media);
}

const prodByOriginal = new Map();
const urlMap = new Map();
const idMap = new Map();
let uploaded = 0;
let reused = 0;

for (const [rel, info] of originals) {
  const { media, reused: wasReused } = await uploadToProd(rel, info);
  if (wasReused) reused += 1;
  else uploaded += 1;
  prodByOriginal.set(rel, media);
  urlMap.set(rel, media.source_url);
  if (info) {
    idMap.set(info.id, media.id);
    for (const size of Object.values(info.media_details?.sizes ?? {})) {
      if (!size.source_url?.startsWith(uploadsPrefix)) continue;
      const prodSize = Object.values(media.media_details?.sizes ?? {}).find(
        (candidate) => candidate.width === size.width && candidate.height === size.height
      );
      urlMap.set(relOf(size.source_url), prodSize?.source_url ?? media.source_url);
    }
  }
}

let rewritten = content.replace(
  new RegExp(`${escapeRegex(uploadsPrefix)}[^"'\\s)\\\\<>]+`, "g"),
  (url) => {
    const rel = relOf(url);
    return urlMap.get(rel) ?? urlMap.get(stripSize(rel)) ?? url;
  }
);
const mapId = (id) => String(idMap.get(Number(id)) ?? id);
rewritten = rewritten
  .replace(/wp-image-(\d+)/g, (_, id) => `wp-image-${mapId(id)}`)
  .replace(/data-id="(\d+)"/g, (_, id) => `data-id="${mapId(id)}"`)
  .replace(/("[A-Za-z]*(?:Id|ID|id)"\s*:\s*)(\d+)/g, (_, prefix, id) => `${prefix}${mapId(id)}`)
  .replace(
    /("ids"\s*:\s*)\[([\d,\s]+)\]/g,
    (_, prefix, list) =>
      `${prefix}[${list
        .split(",")
        .map((id) => mapId(id.trim()))
        .join(",")}]`
  )
  .split(LOCAL_URL)
  .join(PROD_URL);

const payload = {
  title: page.title.raw,
  slug: page.slug,
  content: rewritten,
  excerpt: page.excerpt?.raw ?? "",
  template: page.template,
  featured_media: page.featured_media ? (idMap.get(page.featured_media) ?? 0) : 0,
};
if (publish) payload.status = "publish";

const resolveProdParent = async () => {
  if (type !== "pages" || !page.parent) return 0;
  const localParent = await request(local, `/pages/${page.parent}?context=edit`);
  const [prodParent] = await request(
    prod,
    `/pages?slug=${encodeURIComponent(localParent.slug)}&status=any&context=edit`
  );
  if (!prodParent) fail(`parent page "${localParent.slug}" does not exist on prod, push it first`);
  return prodParent.id;
};

if (type === "pages") payload.parent = await resolveProdParent();

const parentFilter = type === "pages" ? `&parent=${payload.parent}` : "";
const [existing] = await request(
  prod,
  `/${type}?slug=${encodeURIComponent(page.slug)}&status=any&context=edit${parentFilter}`
);
const action = existing ? `update #${existing.id}` : "create (draft)";

if (dryRun) {
  log(
    `dry-run: would ${action} "${payload.title}" | media: ${uploaded} to upload, ${reused} already on prod | ids remapped: ${idMap.size}`
  );
  process.exit(0);
}

const saved = existing
  ? await sendJson(prod, `/${type}/${existing.id}`, "POST", payload)
  : await sendJson(prod, `/${type}`, "POST", { ...payload, status: payload.status ?? "draft" });

log(
  `${existing ? "updated" : "created"} #${saved.id} (${saved.status}) | media: ${uploaded} uploaded, ${reused} reused | ids remapped: ${idMap.size}`
);
log(saved.link);
