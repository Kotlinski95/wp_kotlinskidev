import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const SETTLE_BUFFER_MS = 150;
const DRAG_THRESHOLD_PX = 6;
const SCREEN_TEXTURE_SIZE = 1024;

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const resolveClip = (
  animations: THREE.AnimationClip[],
  clipName: string
): THREE.AnimationClip | null => {
  return THREE.AnimationClip.findByName(animations, clipName) ?? animations[0] ?? null;
};

export const computeReducedMotionTargetTime = (pressed: boolean, clipDuration: number): number =>
  pressed ? clipDuration : 0;

export const getSettleDeadline = (now: number, clipDurationMs: number): number =>
  now + clipDurationMs + SETTLE_BUFFER_MS;

export const hasDragged = (startX: number, startY: number, endX: number, endY: number): boolean =>
  Math.hypot(endX - startX, endY - startY) > DRAG_THRESHOLD_PX;

export const findScreenMaterial = (
  root: THREE.Object3D
): THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | null => {
  let best: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | null = null;
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

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const lines = text.split("\n").filter((line) => line.trim() !== "");
  const fontSize = Math.max(32, Math.floor(canvas.height / (lines.length + 2) / 1.5));
  ctx.fillStyle = "#f2f2f2";
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lineHeight = fontSize * 1.4;
  const startY = canvas.height / 2 - (lineHeight * (lines.length - 1)) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + i * lineHeight, canvas.width * 0.9);
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

const frameCamera = (
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D
): THREE.Vector3 | null => {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) {
    return null;
  }

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.length() / 2, 0.001);
  const fovRadians = (camera.fov * Math.PI) / 180;
  const distance = (radius / Math.sin(fovRadians / 2)) * 1.2;

  camera.position.set(center.x, center.y, center.z + distance);
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  return center;
};

export function mountModelViewer(button: HTMLButtonElement, canvas: HTMLCanvasElement): void {
  const modelUrl = button.dataset.modelUrl;
  const clipName = button.dataset.clipName ?? "open";
  const enableOrbit = button.dataset.enableOrbit === "true";
  const screenText = button.dataset.screenText ?? "";
  if (!modelUrl) {
    return;
  }

  const width = button.clientWidth || 1;
  const height = button.clientHeight || 1;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
  const directional = new THREE.DirectionalLight(0xffffff, 1.5);
  directional.position.set(3, 5, 4);
  scene.add(directional);

  const renderOnce = (): void => renderer.render(scene, camera);
  renderOnce();

  let mixer: THREE.AnimationMixer | null = null;
  let action: THREE.AnimationAction | null = null;
  let clipDurationMs = 0;
  let isPressed = false;
  let rafId = 0;
  let settleUntil = 0;
  let lastTime = 0;

  const stopLoop = (): void => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const loop = (time: number): void => {
    if (!mixer) {
      stopLoop();
      return;
    }
    const delta = lastTime ? (time - lastTime) / 1000 : 0;
    lastTime = time;
    mixer.update(delta);
    renderOnce();

    if (time < settleUntil) {
      rafId = requestAnimationFrame(loop);
    } else {
      stopLoop();
      lastTime = 0;
    }
  };

  const startLoop = (): void => {
    stopLoop();
    lastTime = 0;
    rafId = requestAnimationFrame(loop);
  };

  const handleClick = (): void => {
    if (!mixer || !action) {
      return;
    }

    isPressed = !isPressed;
    button.setAttribute("aria-pressed", String(isPressed));

    if (prefersReducedMotion()) {
      action.paused = true;
      action.time = computeReducedMotionTargetTime(isPressed, action.getClip().duration);
      mixer.update(0);
      renderOnce();
      return;
    }

    action.paused = false;
    action.timeScale = isPressed ? 1 : -1;
    action.play();
    settleUntil = getSettleDeadline(performance.now(), clipDurationMs);
    startLoop();
  };

  let pointerStart: { x: number; y: number } | null = null;
  button.addEventListener("pointerdown", (e) => {
    pointerStart = { x: e.clientX, y: e.clientY };
  });
  button.addEventListener("pointerup", (e) => {
    if (!pointerStart) {
      return;
    }
    const dragged = hasDragged(pointerStart.x, pointerStart.y, e.clientX, e.clientY);
    pointerStart = null;
    if (!dragged) {
      handleClick();
    }
  });

  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf: GLTF) => {
      scene.add(gltf.scene);
      const center = frameCamera(camera, gltf.scene);

      if (screenText) {
        applyScreenText(gltf.scene, screenText);
      }

      const clip = resolveClip(gltf.animations, clipName);
      if (clip) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        action = mixer.clipAction(clip);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
        clipDurationMs = clip.duration * 1000;
      } else if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(`model-viewer: no animation clip named "${clipName}" found in ${modelUrl}`);
      }

      if (enableOrbit) {
        import(
          /* webpackChunkName: "model-viewer-runtime" */ "three/examples/jsm/controls/OrbitControls.js"
        ).then(({ OrbitControls }) => {
          const controls = new OrbitControls(camera, canvas);
          controls.enableDamping = false;
          if (center) {
            controls.target.copy(center);
          }
          controls.update();
          controls.addEventListener("change", renderOnce);
        });
      }

      renderOnce();
      button.classList.add("is-loaded");
    },
    undefined,
    (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error("model-viewer: failed to load model", modelUrl, error);
    }
  );

  const resizeObserver = new ResizeObserver(() => {
    const newWidth = button.clientWidth || 1;
    const newHeight = button.clientHeight || 1;
    renderer.setSize(newWidth, newHeight, false);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderOnce();
  });
  resizeObserver.observe(button);
}
