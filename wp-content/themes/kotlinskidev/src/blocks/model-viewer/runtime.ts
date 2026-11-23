import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { frameCamera } from "./camera-framing";
import {
  bindPointerToggle,
  createClipPlayback,
  createPlaybackController,
  resolveClip,
  type PlaybackController,
} from "./playback";
import { applyScreenText } from "./screen-text";

const MAX_PIXEL_RATIO = 2;
const CAMERA_FOV_DEGREES = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const SKY_LIGHT_COLOR = 0xffffff;
const GROUND_LIGHT_COLOR = 0x444444;
const HEMISPHERE_INTENSITY = 1.2;
const DIRECTIONAL_INTENSITY = 1.5;
const DIRECTIONAL_POSITION = { x: 3, y: 5, z: 4 } as const;

interface ModelViewerConfig {
  modelUrl: string;
  clipName: string;
  enableOrbit: boolean;
  screenText: string;
}

interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderOnce: () => void;
}

const readConfig = (button: HTMLButtonElement): ModelViewerConfig | null => {
  const modelUrl = button.dataset.modelUrl;
  if (!modelUrl) {
    return null;
  }
  return {
    modelUrl,
    clipName: button.dataset.clipName ?? "open",
    enableOrbit: button.dataset.enableOrbit === "true",
    screenText: button.dataset.screenText ?? "",
  };
};

const createStage = (canvas: HTMLCanvasElement, button: HTMLButtonElement): Stage => {
  const width = button.clientWidth || 1;
  const height = button.clientHeight || 1;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setSize(width, height, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV_DEGREES,
    width / height,
    CAMERA_NEAR,
    CAMERA_FAR
  );

  scene.add(new THREE.HemisphereLight(SKY_LIGHT_COLOR, GROUND_LIGHT_COLOR, HEMISPHERE_INTENSITY));
  const directional = new THREE.DirectionalLight(SKY_LIGHT_COLOR, DIRECTIONAL_INTENSITY);
  directional.position.set(DIRECTIONAL_POSITION.x, DIRECTIONAL_POSITION.y, DIRECTIONAL_POSITION.z);
  scene.add(directional);

  const renderOnce = (): void => renderer.render(scene, camera);
  renderOnce();

  return { renderer, scene, camera, renderOnce };
};

const enableOrbitControls = (
  stage: Stage,
  canvas: HTMLCanvasElement,
  center: THREE.Vector3 | null
): void => {
  import(
    /* webpackChunkName: "model-viewer-runtime" */ "three/examples/jsm/controls/OrbitControls.js"
  )
    .then(({ OrbitControls }) => {
      const controls = new OrbitControls(stage.camera, canvas);
      controls.enableDamping = false;
      if (center) {
        controls.target.copy(center);
      }
      controls.update();
      controls.addEventListener("change", stage.renderOnce);
    })
    .catch((error) => console.error("model-viewer: failed to load OrbitControls", error));
};

const onModelLoaded = (
  gltf: GLTF,
  context: {
    config: ModelViewerConfig;
    stage: Stage;
    canvas: HTMLCanvasElement;
    button: HTMLButtonElement;
    playback: PlaybackController;
  }
): void => {
  const { config, stage, canvas, button, playback } = context;
  stage.scene.add(gltf.scene);
  const center = frameCamera(stage.camera, gltf.scene);

  if (config.screenText) {
    applyScreenText(gltf.scene, config.screenText);
  }

  const clip = resolveClip(gltf.animations, config.clipName);
  if (clip) {
    playback.setClip(createClipPlayback(clip, gltf.scene));
  } else if (process.env.NODE_ENV !== "production") {
    console.warn(
      `model-viewer: no animation clip named "${config.clipName}" found in ${config.modelUrl}`
    );
  }

  if (config.enableOrbit) {
    enableOrbitControls(stage, canvas, center);
  }

  stage.renderOnce();
  button.classList.add("is-loaded");
};

const keepStageSizedToButton = (stage: Stage, button: HTMLButtonElement): void => {
  const resizeObserver = new ResizeObserver(() => {
    const newWidth = button.clientWidth || 1;
    const newHeight = button.clientHeight || 1;
    stage.renderer.setSize(newWidth, newHeight, false);
    stage.camera.aspect = newWidth / newHeight;
    stage.camera.updateProjectionMatrix();
    stage.renderOnce();
  });
  resizeObserver.observe(button);
};

export function mountModelViewer(button: HTMLButtonElement, canvas: HTMLCanvasElement): void {
  const config = readConfig(button);
  if (!config) {
    return;
  }

  const stage = createStage(canvas, button);
  const playback = createPlaybackController(button, stage.renderOnce);
  bindPointerToggle(button, playback.toggle);

  new GLTFLoader().load(
    config.modelUrl,
    (gltf: GLTF) => onModelLoaded(gltf, { config, stage, canvas, button, playback }),
    undefined,
    (error: unknown) => {
      console.error("model-viewer: failed to load model", config.modelUrl, error);
    }
  );

  keepStageSizedToButton(stage, button);
}
