#!/usr/bin/env node
// wp-protect.js — PreToolUse hook: blocks access to protected WordPress paths

const PROTECTED = [
  /wp-config\.php/,
  /\/wp-admin\//,
  /\/wp-includes\//,
  /\/wp-content\/plugins\//,
];

const DENY_REASON =
  'BLOCKED: Protected WordPress paths cannot be accessed. ' +
  'Core directories and the site configuration file are restricted.';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  if (PROTECTED.some((re) => re.test(input))) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: DENY_REASON,
      },
    }));
    process.exit(2);
  }
  process.exit(0);
});
