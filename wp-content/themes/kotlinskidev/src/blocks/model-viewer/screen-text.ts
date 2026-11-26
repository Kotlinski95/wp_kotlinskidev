import * as THREE from "three";

const SCREEN_TEXTURE_SIZE = 1024;
const SCREEN_BACKGROUND_COLOR = "#0a0a0a";
const SCREEN_TEXT_COLOR = "#f2f2f2";
const MIN_FONT_SIZE_PX = 32;
const LINE_SLOTS_PADDING = 2;
const FONT_SIZE_DIVISOR = 1.5;
const LINE_HEIGHT_RATIO = 1.4;
const MAX_TEXT_WIDTH_RATIO = 0.9;

type ScreenMaterial = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;

export const findScreenMaterial = (root: THREE.Object3D): ScreenMaterial | null => {
  let best: ScreenMaterial | null = null;
  let bestScore = 0;

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) {
      return;
    }
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const candidate = material as THREE.MeshStandardMaterial;
      if (!candidate.emissiveMap) {
        return;
      }
      const score = candidate.emissiveIntensity ?? 1;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    });
  });

  return best;
};

export const renderScreenTextCanvas = (text: string): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = SCREEN_TEXTURE_SIZE;
  canvas.height = SCREEN_TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return canvas;
  }

  ctx.fillStyle = SCREEN_BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const lines = text.split("\n").filter((line) => line.trim() !== "");
  const fontSize = Math.max(
    MIN_FONT_SIZE_PX,
    Math.floor(canvas.height / (lines.length + LINE_SLOTS_PADDING) / FONT_SIZE_DIVISOR)
  );
  ctx.fillStyle = SCREEN_TEXT_COLOR;
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const startY = canvas.height / 2 - (lineHeight * (lines.length - 1)) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(
      line,
      canvas.width / 2,
      startY + i * lineHeight,
      canvas.width * MAX_TEXT_WIDTH_RATIO
    );
  });

  return canvas;
};

export const applyScreenText = (root: THREE.Object3D, text: string): void => {
  const material = findScreenMaterial(root);
  if (!material) {
    return;
  }

  const canvas = renderScreenTextCanvas(text);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  material.emissiveMap = texture;
  material.needsUpdate = true;
};
