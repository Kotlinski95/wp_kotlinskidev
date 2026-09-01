import { execFileSync } from "node:child_process";
import path from "node:path";

const WP_ROOT = path.resolve(process.cwd(), "..", "..", "..");

function wp(args: string[]): string {
  return execFileSync("wp", args, {
    cwd: WP_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

export function deleteFixturePage(slug: string): void {
  const existingIds = wp(["post", "list", `--name=${slug}`, "--post_type=page", "--field=ID"]);
  for (const id of existingIds.split("\n").filter(Boolean)) {
    wp(["post", "delete", id, "--force"]);
  }
}

export function createFixturePage(
  slug: string,
  title: string,
  content: string
): { id: number; url: string } {
  deleteFixturePage(slug);

  const id = wp([
    "post",
    "create",
    "--post_type=page",
    "--post_status=publish",
    `--post_title=${title}`,
    `--post_name=${slug}`,
    `--post_content=${content}`,
    "--porcelain",
  ]);
  const url = wp(["post", "get", id, "--field=url"]);

  return { id: Number(id), url };
}

export function deleteFixturePostsByType(postType: string, slug: string): void {
  const existingIds = wp([
    "post",
    "list",
    `--name=${slug}`,
    `--post_type=${postType}`,
    "--field=ID",
  ]);
  for (const id of existingIds.split("\n").filter(Boolean)) {
    wp(["post", "delete", id, "--force"]);
  }
}

export function createFixturePost(
  postType: string,
  slug: string,
  title: string,
  meta: Record<string, string> = {}
): { id: number; url: string } {
  deleteFixturePostsByType(postType, slug);

  const id = wp([
    "post",
    "create",
    `--post_type=${postType}`,
    "--post_status=publish",
    `--post_title=${title}`,
    `--post_name=${slug}`,
    "--porcelain",
  ]);

  for (const [key, value] of Object.entries(meta)) {
    wp(["post", "meta", "update", id, key, value]);
  }

  const url = wp(["post", "get", id, "--field=url"]);

  return { id: Number(id), url };
}

export function getPostUrl(id: number): string {
  return wp(["post", "get", String(id), "--field=url"]);
}

export function importFixtureMedia(filePath: string): { id: number; url: string } {
  const id = wp(["media", "import", filePath, "--porcelain"]);
  const url = wp(["eval", `echo wp_get_attachment_url(${id});`]);

  return { id: Number(id), url };
}

export function deletePost(id: number): void {
  wp(["post", "delete", String(id), "--force"]);
}

export interface RegisteredPattern {
  name: string;
  content: string;
}

export function getRegisteredPatterns(): RegisteredPattern[] {
  const script = `
$patterns = WP_Block_Patterns_Registry::get_instance()->get_all_registered();
$theme_patterns = array_values(array_filter($patterns, function ($pattern) {
    return isset($pattern['name']) && str_starts_with($pattern['name'], 'kotlinskidev/');
}));
echo wp_json_encode(array_map(function ($pattern) {
    return ['name' => $pattern['name'], 'content' => $pattern['content']];
}, $theme_patterns));
`;

  return JSON.parse(wp(["eval", script]));
}
