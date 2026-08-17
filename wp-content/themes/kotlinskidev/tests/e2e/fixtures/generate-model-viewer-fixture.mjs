import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
};

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x8209d3 });
const cube = new THREE.Mesh(geometry, material);
cube.name = "Cube";

const times = [0, 1];
const values = [0, 0, 0, 1, 0, Math.PI, 0, 0];
const track = new THREE.QuaternionKeyframeTrack(".quaternion", times, values);
const clip = new THREE.AnimationClip("open", 1, [track]);
cube.animations = [clip];

const exporter = new GLTFExporter();

exporter.parse(
  cube,
  async (result) => {
    const buffer = Buffer.from(result);
    const outPath = path.resolve(__dirname, "model-viewer-cube.glb");
    await writeFile(outPath, buffer);
    // eslint-disable-next-line no-console
    console.log(`Wrote ${outPath} (${buffer.byteLength} bytes)`);
  },
  (error) => {
    // eslint-disable-next-line no-console
    console.error("GLTFExporter failed", error);
    process.exitCode = 1;
  },
  { binary: true, animations: [clip] }
);
