#!/usr/bin/env node
// wp-format.js — PostToolUse hook: run Prettier on the file that was just edited

const { execFileSync } = require('child_process');
const path = require('path');

const THEME_DIR = path.resolve(__dirname, '../../wp-content/themes/kotlinskidev');
const PRETTIER = path.join(THEME_DIR, 'node_modules', '.bin', 'prettier');
const FORMATTABLE = new Set(['.ts', '.tsx', '.js', '.jsx', '.scss', '.css', '.json']);

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let data;
  try { data = JSON.parse(input); } catch { process.exit(0); }

  const filePath = data?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  if (!FORMATTABLE.has(path.extname(filePath))) process.exit(0);

  try {
    execFileSync(PRETTIER, ['--write', filePath], { stdio: 'pipe' });
  } catch {
    // Non-fatal: file may be outside prettier scope or have a parse error
  }

  process.exit(0);
});
