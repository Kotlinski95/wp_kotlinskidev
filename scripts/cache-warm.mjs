#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';

const STATE_FILE = '/var/lib/kotlinskidev-cache-warm/last-run';
const USER_AGENT =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 kotlinskidev-cache-warm';
const ASSET_EXTENSIONS = new Set([
	'js', 'css', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg', 'ico',
	'woff', 'woff2', 'ttf', 'otf', 'mp4', 'webm', 'mov', 'glb', 'gltf',
]);
const ASSET_PATH_PREFIXES = ['/wp-content/', '/wp-includes/'];
const REQUEST_TIMEOUT_MS = 90_000;

const decodeEntities = (text) =>
	text.replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchUrl(url, { keepBody }) {
	const startedAt = Date.now();
	try {
		const response = await fetch(url, {
			headers: { 'user-agent': USER_AGENT, accept: '*/*', 'accept-encoding': 'gzip, br' },
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			redirect: 'follow',
		});
		const buffer = Buffer.from(await response.arrayBuffer());
		return {
			url,
			status: response.status,
			cacheStatus: response.headers.get('cf-cache-status') ?? '-',
			age: Number(response.headers.get('age') ?? -1),
			body: keepBody ? buffer.toString('utf8') : '',
			bytes: buffer.length,
			seconds: (Date.now() - startedAt) / 1000,
		};
	} catch {
		return { url, status: 0, cacheStatus: '-', age: -1, body: '', bytes: 0, seconds: (Date.now() - startedAt) / 1000 };
	}
}

async function runPool(items, workers, task, delayMs = 0) {
	const results = new Array(items.length);
	let nextIndex = 0;
	async function worker() {
		while (nextIndex < items.length) {
			const index = nextIndex++;
			results[index] = await task(items[index]);
			if (delayMs) await sleep(delayMs);
		}
	}
	await Promise.all(Array.from({ length: Math.min(workers, items.length) }, worker));
	return results;
}

const extractLocations = (xml) => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => decodeEntities(match[1]));

async function readSitemapUrls(base) {
	const index = await fetchUrl(`${base}/sitemap_index.xml`, { keepBody: true });
	if (index.status !== 200) return [];
	const childSitemaps = extractLocations(index.body);
	const children = await Promise.all(childSitemaps.map((url) => fetchUrl(url, { keepBody: true })));
	return children.filter((child) => child.status === 200).flatMap((child) => extractLocations(child.body));
}

function languageAlternates(pageHtml, pageUrl) {
	const alternates = [];
	for (const tag of pageHtml.match(/<link[^>]+hreflang=[^>]*>/gi) ?? []) {
		const href = tag.match(/href\s*=\s*["']([^"']+)["']/i);
		if (href) alternates.push(new URL(decodeEntities(href[1]), pageUrl).href);
	}
	return alternates;
}

function collectAssetReferences(text, isStylesheet) {
	const references = [];
	for (const match of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)) references.push(match[1]);
	if (isStylesheet) return references;
	for (const match of text.matchAll(/(?:src|href|poster|data-src|data-poster|data-bg|data-lazy-src)\s*=\s*["']([^"']+)["']/gi)) {
		references.push(match[1]);
	}
	for (const match of text.matchAll(/(?:srcset|data-srcset)\s*=\s*["']([^"']+)["']/gi)) {
		for (const candidate of match[1].split(',')) {
			const reference = candidate.trim().split(/\s+/)[0];
			if (reference) references.push(reference);
		}
	}
	return references;
}

function assetUrls(text, sourceUrl, base, isStylesheet) {
	const baseHost = new URL(base).host;
	const found = new Set();
	for (const reference of collectAssetReferences(text, isStylesheet)) {
		if (/^(data:|#|javascript:|mailto:|tel:)/i.test(reference)) continue;
		let parsed;
		try {
			parsed = new URL(decodeEntities(reference), sourceUrl);
		} catch {
			continue;
		}
		const extension = parsed.pathname.includes('.') ? parsed.pathname.split('.').pop().toLowerCase() : '';
		const isSiteAsset =
			parsed.host === baseHost &&
			ASSET_PATH_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix)) &&
			ASSET_EXTENSIONS.has(extension);
		if (isSiteAsset) {
			parsed.hash = '';
			found.add(parsed.href);
		}
	}
	return found;
}

async function warmPages(urls, workers, delayMs, base) {
	const results = await runPool(urls, workers, (url) => fetchUrl(url, { keepBody: true }), delayMs);
	const assets = new Set();
	for (const page of results) {
		if (page.status === 200) for (const asset of assetUrls(page.body, page.url, base, false)) assets.add(asset);
	}
	return { results, assets };
}

async function warmAssets(initialAssets, workers, base) {
	const results = [];
	const seen = new Set(initialAssets);
	let pending = [...initialAssets];
	while (pending.length) {
		const stylesheets = pending.filter((url) => new URL(url).pathname.endsWith('.css'));
		const others = pending.filter((url) => !stylesheets.includes(url));
		pending = [];
		const stylesheetResults = await runPool(stylesheets, workers, (url) => fetchUrl(url, { keepBody: true }));
		for (const stylesheet of stylesheetResults) {
			results.push(stylesheet);
			if (stylesheet.status !== 200) continue;
			for (const found of assetUrls(stylesheet.body, stylesheet.url, base, true)) {
				if (!seen.has(found)) {
					seen.add(found);
					pending.push(found);
				}
			}
		}
		results.push(...(await runPool(others, workers, (url) => fetchUrl(url, { keepBody: false }))));
	}
	return results;
}

function summarize(label, results) {
	const counts = {};
	for (const result of results) {
		const key = result.status === 200 ? result.cacheStatus : `http${result.status}`;
		counts[key] = (counts[key] ?? 0) + 1;
	}
	const detail = Object.entries(counts).sort().map(([name, count]) => `${name}=${count}`).join(', ');
	const slowest = Math.max(0, ...results.map((result) => result.seconds));
	const megabytes = results.reduce((sum, result) => sum + result.bytes, 0) / 1048576;
	return `${label}: ${results.length} requests (${detail}), ${megabytes.toFixed(1)} MB, slowest ${slowest.toFixed(1)}s`;
}

async function runFull({ base, workers, delayMs, limit }) {
	const startedAt = Date.now();
	let urls = [...new Set([`${base}/`, ...(await readSitemapUrls(base))])];
	if (limit) urls = urls.slice(0, limit);
	const first = await warmPages(urls, workers, delayMs, base);
	let pages = first.results;
	const assets = first.assets;
	if (!limit) {
		const known = new Set(urls);
		const extra = new Set();
		for (const page of pages) {
			if (page.status !== 200) continue;
			for (const alternate of languageAlternates(page.body, page.url)) {
				if (new URL(alternate).host === new URL(base).host && !known.has(alternate)) extra.add(alternate);
			}
		}
		if (extra.size) {
			const more = await warmPages([...extra], workers, delayMs, base);
			pages = pages.concat(more.results);
			for (const asset of more.assets) assets.add(asset);
		}
	}
	const assetResults = await warmAssets(assets, workers, base);
	console.log(summarize('pages', pages));
	console.log(summarize('assets', assetResults));
	for (const failure of [...pages, ...assetResults].filter((result) => result.status !== 200).slice(0, 10)) {
		console.log(`failed: ${failure.status} ${failure.url}`);
	}
	console.log(`done in ${Math.round((Date.now() - startedAt) / 1000)}s`);
	const blocked = pages.slice(0, 3).some((page) => [0, 403, 429].includes(page.status));
	return blocked ? 1 : 0;
}

async function shouldWarm(base) {
	const canary = await fetchUrl(`${base}/`, { keepBody: false });
	if (canary.status !== 200) {
		console.log(`canary status ${canary.status}, skipping`);
		return false;
	}
	if (canary.cacheStatus !== 'HIT') {
		console.log(`canary cache status ${canary.cacheStatus}, warming`);
		return true;
	}
	let lastRunSeconds;
	try {
		lastRunSeconds = Number((await readFile(STATE_FILE, 'utf8')).trim());
	} catch {
		console.log('no previous run recorded, warming');
		return true;
	}
	const cacheRebuiltSinceLastRun = canary.age >= 0 && Date.now() / 1000 - canary.age > lastRunSeconds + 60;
	console.log(`canary HIT age=${canary.age}s, ${cacheRebuiltSinceLastRun ? 'cache rebuilt since last run, warming' : 'still warm'}`);
	return cacheRebuiltSinceLastRun;
}

async function recordRun() {
	try {
		await mkdir(dirname(STATE_FILE), { recursive: true });
		await writeFile(STATE_FILE, String(Date.now() / 1000));
	} catch (error) {
		console.error(`could not write state file: ${error.message}`);
	}
}

async function main() {
	const { values } = parseArgs({
		options: {
			base: { type: 'string', default: 'https://kotlinskidev.com' },
			mode: { type: 'string', default: 'full' },
			workers: { type: 'string', default: '2' },
			delay: { type: 'string', default: '300' },
			limit: { type: 'string', default: '0' },
			'no-state': { type: 'boolean', default: false },
		},
	});
	const base = values.base.replace(/\/$/, '');
	console.log(new Date().toISOString(), `mode=${values.mode}`);
	if (values.mode === 'check' && !(await shouldWarm(base))) return 0;
	const exitCode = await runFull({ base, workers: Number(values.workers), delayMs: Number(values.delay), limit: Number(values.limit) });
	if (exitCode === 0 && !values['no-state']) await recordRun();
	return exitCode;
}

process.exit(await main());
