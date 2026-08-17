const mockRender = jest.fn();
const mockSetSize = jest.fn();
const mockSetPixelRatio = jest.fn();
const mockSceneAdd = jest.fn();
const mockUpdateProjectionMatrix = jest.fn();
const mockLookAt = jest.fn();
const mockCameraPositionSet = jest.fn();
const mockDirectionalPositionSet = jest.fn();

let mockAction: {
  play: jest.Mock;
  paused: boolean;
  timeScale: number;
  time: number;
  clampWhenFinished: boolean;
  loop: unknown;
  getClip: () => { duration: number };
};
let mockMixerUpdate: jest.Mock;
let mockClipActionSpy: jest.Mock;

let mockFindByName: jest.Mock;

jest.mock("three", () => {
  class MockVector3 {
    x = 0;
    y = 0;
    z = 0;
    length = jest.fn(() => 2);
  }

  class MockBox3 {
    setFromObject = jest.fn().mockReturnThis();
    isEmpty = jest.fn(() => false);
    getCenter = jest.fn((v: MockVector3) => v);
    getSize = jest.fn((v: MockVector3) => v);
  }

  return {
    __esModule: true,
    LoopOnce: "LoopOnce",
    SRGBColorSpace: "srgb",
    Vector3: MockVector3,
    Box3: MockBox3,
    CanvasTexture: jest.fn().mockImplementation(() => ({ colorSpace: "" })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setPixelRatio: mockSetPixelRatio,
      setSize: mockSetSize,
      render: mockRender,
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: mockSceneAdd,
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      fov: 45,
      aspect: 1,
      near: 0.1,
      far: 100,
      position: { set: mockCameraPositionSet, x: 0, y: 0, z: 0 },
      lookAt: mockLookAt,
      updateProjectionMatrix: mockUpdateProjectionMatrix,
    })),
    HemisphereLight: jest.fn(),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: mockDirectionalPositionSet },
    })),
    AnimationMixer: jest.fn().mockImplementation(() => ({
      clipAction: (...args: unknown[]) => {
        mockClipActionSpy(...args);
        return mockAction;
      },
      update: mockMixerUpdate,
    })),
    AnimationClip: {
      findByName: (...args: unknown[]) => mockFindByName(...args),
    },
  };
});

let mockLoad: jest.Mock;
jest.mock("three/examples/jsm/loaders/GLTFLoader.js", () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: (...args: unknown[]) => mockLoad(...args),
  })),
}));

const mockOrbitControlsInstance = {
  enableDamping: true,
  target: { copy: jest.fn() },
  update: jest.fn(),
  addEventListener: jest.fn(),
};
const mockOrbitControlsCtor = jest.fn().mockImplementation(() => mockOrbitControlsInstance);

class MockOrbitControls {
  constructor(...args: unknown[]) {
    return mockOrbitControlsCtor(...args);
  }
}

jest.mock("three/examples/jsm/controls/OrbitControls.js", () => ({
  OrbitControls: MockOrbitControls,
}));

import {
  resolveClip,
  computeReducedMotionTargetTime,
  getSettleDeadline,
  hasDragged,
  findScreenMaterial,
  renderScreenTextCanvas,
} from "./runtime";
import * as THREE from "three";

function tap(button: HTMLElement, x = 10, y = 10): void {
  button.dispatchEvent(new MouseEvent("pointerdown", { clientX: x, clientY: y }));
  button.dispatchEvent(new MouseEvent("pointerup", { clientX: x, clientY: y }));
}

function drag(
  button: HTMLElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): void {
  button.dispatchEvent(new MouseEvent("pointerdown", { clientX: startX, clientY: startY }));
  button.dispatchEvent(new MouseEvent("pointerup", { clientX: endX, clientY: endY }));
}

beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillRect: jest.fn(),
    fillText: jest.fn(),
    fillStyle: "",
    font: "",
    textAlign: "",
    textBaseline: "",
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  (HTMLCanvasElement.prototype.getContext as jest.Mock)?.mockRestore?.();
});

describe("model-viewer/runtime.ts — pure helpers", () => {
  it("resolveClip finds a clip by exact name", () => {
    const clips = [{ name: "open" }, { name: "other" }] as any;
    (require("three").AnimationClip.findByName as jest.Mock) = jest.fn(
      (list, name) => list.find((c: any) => c.name === name) ?? null
    );

    expect(resolveClip(clips, "open")).toBe(clips[0]);
  });

  it("resolveClip falls back to the first clip when the named clip isn't found", () => {
    const clips = [{ name: "a" }, { name: "b" }] as any;
    (require("three").AnimationClip.findByName as jest.Mock) = jest.fn(() => null);

    expect(resolveClip(clips, "missing")).toBe(clips[0]);
  });

  it("resolveClip returns null when there are no clips at all", () => {
    (require("three").AnimationClip.findByName as jest.Mock) = jest.fn(() => null);

    expect(resolveClip([], "open")).toBeNull();
  });

  it("computeReducedMotionTargetTime returns 0 when not pressed", () => {
    expect(computeReducedMotionTargetTime(false, 2)).toBe(0);
  });

  it("computeReducedMotionTargetTime returns the clip duration when pressed", () => {
    expect(computeReducedMotionTargetTime(true, 2)).toBe(2);
  });

  it("getSettleDeadline adds the clip duration plus a settle buffer to now", () => {
    expect(getSettleDeadline(1000, 500)).toBe(1000 + 500 + 150);
  });

  it("hasDragged is false for a tiny movement under the threshold", () => {
    expect(hasDragged(10, 10, 12, 11)).toBe(false);
  });

  it("hasDragged is true once movement exceeds the threshold", () => {
    expect(hasDragged(10, 10, 40, 10)).toBe(true);
  });

  it("findScreenMaterial returns null when no mesh has an emissive map", () => {
    const root = {
      traverse: (cb: (obj: any) => void) => {
        cb({ isMesh: true, material: { emissiveMap: null } });
      },
    } as unknown as THREE.Object3D;

    expect(findScreenMaterial(root)).toBeNull();
  });

  it("findScreenMaterial picks the material with the highest emissiveIntensity among emissive-mapped materials", () => {
    const dim = { emissiveMap: {}, emissiveIntensity: 1 };
    const bright = { emissiveMap: {}, emissiveIntensity: 8 };
    const root = {
      traverse: (cb: (obj: any) => void) => {
        cb({ isMesh: true, material: dim });
        cb({ isMesh: true, material: bright });
        cb({ isMesh: false, material: { emissiveMap: {}, emissiveIntensity: 99 } });
      },
    } as unknown as THREE.Object3D;

    expect(findScreenMaterial(root)).toBe(bright);
  });

  it("findScreenMaterial checks every material on a multi-material mesh", () => {
    const bright = { emissiveMap: {}, emissiveIntensity: 5 };
    const root = {
      traverse: (cb: (obj: any) => void) => {
        cb({ isMesh: true, material: [{ emissiveMap: null }, bright] });
      },
    } as unknown as THREE.Object3D;

    expect(findScreenMaterial(root)).toBe(bright);
  });

  it("renderScreenTextCanvas draws each non-empty line and skips blank lines", () => {
    const canvas = renderScreenTextCanvas("hello@example.test\n\n+1 555 0100");

    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBeGreaterThan(0);
  });
});

describe("model-viewer/runtime.ts — mountModelViewer click wiring", () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMixerUpdate = jest.fn();
    mockClipActionSpy = jest.fn();
    mockFindByName = jest.fn((clips: any[], name: string) => clips.find((c) => c.name === name));
    mockAction = {
      play: jest.fn(),
      paused: false,
      timeScale: 1,
      time: 0,
      clampWhenFinished: false,
      loop: null,
      getClip: () => ({ duration: 1 }),
    };
    mockLoad = jest.fn();

    matchMediaMock = jest.fn().mockReturnValue({ matches: false });
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

    class MockResizeObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    }
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = MockResizeObserver;

    document.body.innerHTML = "";
  });

  function buildButtonAndCanvas() {
    const button = document.createElement("button");
    button.dataset.modelUrl = "https://example.test/model.glb";
    button.dataset.clipName = "open";
    button.setAttribute("aria-pressed", "false");
    Object.defineProperty(button, "clientWidth", { value: 300, configurable: true });
    Object.defineProperty(button, "clientHeight", { value: 200, configurable: true });
    const canvas = document.createElement("canvas");
    button.append(canvas);
    document.body.append(button);
    return { button, canvas };
  }

  it("does nothing when the trigger has no data-model-url", async () => {
    const { mountModelViewer } = await import("./runtime");
    const button = document.createElement("button");
    const canvas = document.createElement("canvas");

    expect(() => mountModelViewer(button, canvas)).not.toThrow();
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it("loads the model and wires the click handler when a matching clip is found", async () => {
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    const fakeGltf = { scene: {}, animations: [{ name: "open", duration: 1 }] };
    mockLoad = jest.fn((_url, onLoad) => onLoad(fakeGltf));

    mountModelViewer(button, canvas);

    expect(mockSceneAdd).toHaveBeenCalledWith(fakeGltf.scene);
    expect(button.classList.contains("is-loaded")).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("false");

    tap(button);

    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(mockAction.timeScale).toBe(1);
    expect(mockAction.play).toHaveBeenCalled();
  });

  it("toggles aria-pressed back off and reverses timeScale on a second click", async () => {
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    const fakeGltf = { scene: {}, animations: [{ name: "open", duration: 1 }] };
    mockLoad = jest.fn((_url, onLoad) => onLoad(fakeGltf));

    mountModelViewer(button, canvas);
    tap(button);
    tap(button);

    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(mockAction.timeScale).toBe(-1);
  });

  it("jumps instantly instead of tweening when prefers-reduced-motion is set", async () => {
    matchMediaMock.mockReturnValue({ matches: true });
    mockAction.getClip = () => ({ duration: 2 });
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    const fakeGltf = { scene: {}, animations: [{ name: "open", duration: 2 }] };
    mockLoad = jest.fn((_url, onLoad) => onLoad(fakeGltf));

    mountModelViewer(button, canvas);
    tap(button);

    expect(mockAction.paused).toBe(true);
    expect(mockAction.time).toBe(2);
    expect(mockAction.play).not.toHaveBeenCalled();
    expect(mockMixerUpdate).toHaveBeenCalledWith(0);
  });

  it("does not wire a click handler when no animation clip is found at all", async () => {
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    const fakeGltf = { scene: {}, animations: [] };
    mockLoad = jest.fn((_url, onLoad) => onLoad(fakeGltf));
    mockFindByName = jest.fn(() => null);

    mountModelViewer(button, canvas);
    expect(() => tap(button)).not.toThrow();
    expect(button.hasAttribute("aria-pressed")).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(console).toHaveWarned();
  });

  it("leaves the fallback visible and does not throw when the model fails to load", async () => {
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    mockLoad = jest.fn((_url, _onLoad, _onProgress, onError) =>
      onError(new Error("network error"))
    );

    expect(() => mountModelViewer(button, canvas)).not.toThrow();
    expect(button.classList.contains("is-loaded")).toBe(false);
    expect(console).toHaveErrored();
  });

  it("does not toggle when the pointer moved far enough to count as a drag, not a click", async () => {
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    const fakeGltf = { scene: {}, animations: [{ name: "open", duration: 1 }] };
    mockLoad = jest.fn((_url, onLoad) => onLoad(fakeGltf));

    mountModelViewer(button, canvas);
    drag(button, 10, 10, 60, 10);

    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(mockAction.play).not.toHaveBeenCalled();
  });

  it("wires OrbitControls when data-enable-orbit is set, targeting the framed center", async () => {
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    button.dataset.enableOrbit = "true";
    const fakeGltf = { scene: {}, animations: [] };
    mockLoad = jest.fn((_url, onLoad) => onLoad(fakeGltf));

    mountModelViewer(button, canvas);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockOrbitControlsCtor).toHaveBeenCalled();
    expect(mockOrbitControlsInstance.update).toHaveBeenCalled();
    expect(mockOrbitControlsInstance.target.copy).toHaveBeenCalled();
    expect(mockOrbitControlsInstance.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
    expect(console).toHaveWarned();
  });

  it("does not load OrbitControls when data-enable-orbit is absent", async () => {
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    const fakeGltf = { scene: {}, animations: [] };
    mockLoad = jest.fn((_url, onLoad) => onLoad(fakeGltf));

    mountModelViewer(button, canvas);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockOrbitControlsCtor).not.toHaveBeenCalled();
    expect(console).toHaveWarned();
  });

  it("applies screen text to the detected emissive material when data-screen-text is set", async () => {
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    button.dataset.screenText = "hello@example.test";
    const emissiveMaterial = { emissiveMap: {}, emissiveIntensity: 8, needsUpdate: false };
    const fakeScene = {
      traverse: (cb: (obj: any) => void) => {
        cb({ isMesh: true, material: emissiveMaterial });
      },
    };
    const fakeGltf = { scene: fakeScene, animations: [] };
    mockLoad = jest.fn((_url, onLoad) => onLoad(fakeGltf));

    mountModelViewer(button, canvas);

    expect(emissiveMaterial.needsUpdate).toBe(true);
    expect(THREE.CanvasTexture as unknown as jest.Mock).toHaveBeenCalled();
    expect(console).toHaveWarned();
  });

  it("does not touch any material when data-screen-text is absent", async () => {
    const { mountModelViewer } = await import("./runtime");
    const { button, canvas } = buildButtonAndCanvas();
    const emissiveMaterial = { emissiveMap: {}, emissiveIntensity: 8, needsUpdate: false };
    const fakeScene = {
      traverse: (cb: (obj: any) => void) => {
        cb({ isMesh: true, material: emissiveMaterial });
      },
    };
    const fakeGltf = { scene: fakeScene, animations: [] };
    mockLoad = jest.fn((_url, onLoad) => onLoad(fakeGltf));

    mountModelViewer(button, canvas);

    expect(emissiveMaterial.needsUpdate).toBe(false);
    expect(console).toHaveWarned();
  });
});
