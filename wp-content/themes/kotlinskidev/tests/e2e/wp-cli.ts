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

export function getPostUrl(id: number): string {
  return wp(["post", "get", String(id), "--field=url"]);
}

export function deletePost(id: number): void {
  wp(["post", "delete", String(id), "--force"]);
}
