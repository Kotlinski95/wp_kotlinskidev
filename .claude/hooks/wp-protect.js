#!/usr/bin/env node
// wp-protect.js — PreToolUse hook: blocks access to protected WordPress paths

const PROTECTED = [
  /wp-config\.php/,
  /\/wp-admin\//,
  /\/wp-includes\//,
  /\/wp-content\/plugins\//,
];

const ALLOWED = [
  /\/wp-content\/plugins\/text-justify-controls\//,
  /\/wp-content\/plugins\/responsive-spacing-controls\//,
  /\/wp-content\/plugins\/responsive-image\//,
  /\/wp-content\/plugins\/responsive-font-controls\//,
  /\/wp-content\/plugins\/wordpress-pwa-manager\//,
  /\/wp-content\/plugins\/kotlinskidev-custom-login\//,
  /\/wp-content\/plugins\/google-maps-block\//,
  /\/wp-content\/plugins\/custom-google-analytics-loader\//,
  /\/wp-content\/plugins\/custom-facebook-pixel-loader\//,
  /\/wp-content\/plugins\/contact-form-ts\//,
  /\/wp-content\/plugins\/block-visibility\//,
];

const DENY_REASON =
  'BLOCKED: Protected WordPress paths cannot be accessed. ' +
  'Core directories and the site configuration file are restricted.';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  if (PROTECTED.some((re) => re.test(input)) && !ALLOWED.some((re) => re.test(input))) {
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
