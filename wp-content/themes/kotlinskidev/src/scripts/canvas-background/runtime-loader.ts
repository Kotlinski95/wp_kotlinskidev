import type * as Runtime from "./runtime";

type RuntimeModule = typeof Runtime;

let runtimeModulePromise: Promise<RuntimeModule> | null = null;

const loadRuntime = (): Promise<RuntimeModule> => {
  if (!runtimeModulePromise) {
    runtimeModulePromise = import(/* webpackChunkName: "canvas-background-runtime" */ "./runtime");
  }
  return runtimeModulePromise;
};

export const withRuntime = (action: (runtime: RuntimeModule) => void): void => {
  loadRuntime()
    .then(action)
    .catch((error) => console.error("canvas-background: failed to load runtime", error));
};
