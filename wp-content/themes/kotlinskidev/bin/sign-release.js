const crypto = require("crypto");
const fs = require("fs");

const zipPath = process.argv[2];
const pem = process.env.RELEASE_SIGNING_KEY;

if (!zipPath || !fs.existsSync(zipPath)) {
  process.stderr.write("Usage: node bin/sign-release.js <path-to-zip>\n");
  process.exit(1);
}

if (!pem || pem.trim() === "") {
  process.stderr.write(
    "RELEASE_SIGNING_KEY is not set; refusing to publish an unsigned release.\n"
  );
  process.exit(1);
}

const key = crypto.createPrivateKey(pem);
if (key.asymmetricKeyType !== "ed25519") {
  process.stderr.write("RELEASE_SIGNING_KEY must be an Ed25519 PKCS8 PEM key.\n");
  process.exit(1);
}

const signature = crypto.sign(null, fs.readFileSync(zipPath), key);
fs.writeFileSync(`${zipPath}.sig`, `${signature.toString("base64")}\n`);
process.stdout.write(`Signed ${zipPath} -> ${zipPath}.sig\n`);
