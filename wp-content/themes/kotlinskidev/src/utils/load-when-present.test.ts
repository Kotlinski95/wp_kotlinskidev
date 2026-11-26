const loadModule = () => {
  jest.resetModules();
  return require("./load-when-present") as typeof import("./load-when-present");
};

const flushMutations = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("loadWhenPresent", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("calls the loader immediately when the selector already matches", () => {
    document.body.innerHTML = '<div class="target"></div>';
    const loader = jest.fn(() => Promise.resolve());
    loadModule().loadWhenPresent(".target", loader);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("does not call the loader when nothing matches", async () => {
    const loader = jest.fn(() => Promise.resolve());
    loadModule().loadWhenPresent(".missing", loader);
    await flushMutations();
    expect(loader).not.toHaveBeenCalled();
  });

  it("calls the loader once when a matching element is inserted later", async () => {
    const loader = jest.fn(() => Promise.resolve());
    loadModule().loadWhenPresent(".late", loader);
    const el = document.createElement("div");
    el.className = "late";
    document.body.append(el);
    await flushMutations();
    document.body.append(document.createElement("div"));
    await flushMutations();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  describe("after the grace period", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it("disconnects the mutation observer 10s after load while still pending", () => {
      const disconnect = jest.spyOn(MutationObserver.prototype, "disconnect");
      loadModule().loadWhenPresent(
        ".late",
        jest.fn(() => Promise.resolve())
      );
      expect(disconnect).not.toHaveBeenCalled();
      jest.advanceTimersByTime(10000);
      expect(disconnect).toHaveBeenCalled();
    });

    it("still loads content inserted later once the user interacts", () => {
      const loader = jest.fn(() => Promise.resolve());
      loadModule().loadWhenPresent(".late", loader);
      jest.advanceTimersByTime(10000);

      const el = document.createElement("div");
      el.className = "late";
      document.body.append(el);
      expect(loader).not.toHaveBeenCalled();

      document.dispatchEvent(new Event("pointerdown"));
      expect(loader).toHaveBeenCalledTimes(1);

      document.dispatchEvent(new Event("pointerdown"));
      expect(loader).toHaveBeenCalledTimes(1);
    });
  });
});
