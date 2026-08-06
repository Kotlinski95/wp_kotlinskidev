class MockXHR {
  static instances: MockXHR[] = [];
  method = "";
  url = "";
  headers: Record<string, string> = {};
  sentBody = "";
  onreadystatechange: (() => void) | null = null;
  readyState = 0;
  status = 0;
  responseText = "";

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }

  send(body: string) {
    this.sentBody = body;
    MockXHR.instances.push(this);
  }

  respond(status: number, responseText: string) {
    this.status = status;
    this.readyState = 4;
    this.responseText = responseText;
    this.onreadystatechange?.();
  }
}

function setAjaxGlobal() {
  (window as unknown as { kotlinskidev_ajax?: unknown }).kotlinskidev_ajax = {
    ajaxurl: "/wp-admin/admin-ajax.php",
    nonce: "abc123",
  };
}

function loadWithPostId(postId: number) {
  document.body.innerHTML = "";
  document.body.className = `postid-${postId}`;
  jest.resetModules();
  require("./page-views");
}

describe("page-views.ts", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    MockXHR.instances = [];
    (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = MockXHR;
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 0 });
    Object.defineProperty(document, "hidden", { writable: true, configurable: true, value: false });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete (window as unknown as { kotlinskidev_ajax?: unknown }).kotlinskidev_ajax;
    document.body.className = "";
  });

  it("does nothing when kotlinskidev_ajax is not present on window", () => {
    document.body.className = "postid-5";
    jest.resetModules();

    expect(() => require("./page-views")).not.toThrow();
    expect(MockXHR.instances).toHaveLength(0);
  });

  it("does nothing when no post id can be determined", () => {
    setAjaxGlobal();
    document.body.className = "";
    jest.resetModules();

    require("./page-views");
    jest.advanceTimersByTime(10000);

    expect(MockXHR.instances).toHaveLength(0);
  });

  it("reads the post id from a meta tag when present", () => {
    setAjaxGlobal();
    document.body.innerHTML = '<meta name="post-id" content="42">';
    document.body.className = "";
    jest.resetModules();

    require("./page-views");
    jest.advanceTimersByTime(10000);

    expect(MockXHR.instances[0].sentBody).toContain("post_id=42");
  });

  it("reads the post id from a page-id- body class", () => {
    setAjaxGlobal();
    document.body.innerHTML = "";
    document.body.className = "page-id-7";
    jest.resetModules();

    require("./page-views");
    jest.advanceTimersByTime(10000);

    expect(MockXHR.instances[0].sentBody).toContain("post_id=7");
  });

  it("tracks the view once the user scrolls past 100px", () => {
    setAjaxGlobal();
    loadWithPostId(9);

    window.dispatchEvent(new Event("scroll"));
    expect(MockXHR.instances).toHaveLength(0);

    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 150 });
    window.dispatchEvent(new Event("scroll"));

    expect(MockXHR.instances).toHaveLength(1);
  });

  it("tracks the view when the page becomes hidden after the minimum dwell time", () => {
    setAjaxGlobal();
    loadWithPostId(9);
    jest.advanceTimersByTime(3000);

    Object.defineProperty(document, "hidden", { writable: true, configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(MockXHR.instances).toHaveLength(1);
  });

  it("does not track on visibilitychange before the minimum dwell time unless scrolled", () => {
    setAjaxGlobal();
    loadWithPostId(9);

    Object.defineProperty(document, "hidden", { writable: true, configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(MockXHR.instances).toHaveLength(0);
  });

  it("tracks the view after 10 seconds regardless of scroll or visibility", () => {
    setAjaxGlobal();
    loadWithPostId(9);

    jest.advanceTimersByTime(10000);

    expect(MockXHR.instances).toHaveLength(1);
  });

  it("does not send a second tracking request the same day for the same post", () => {
    setAjaxGlobal();
    loadWithPostId(9);

    jest.advanceTimersByTime(10000);
    expect(MockXHR.instances).toHaveLength(1);

    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 200 });
    window.dispatchEvent(new Event("scroll"));

    expect(MockXHR.instances).toHaveLength(1);
  });

  it("sends the expected AJAX action, post id, and nonce", () => {
    setAjaxGlobal();
    loadWithPostId(13);

    jest.advanceTimersByTime(10000);

    const request = MockXHR.instances[0];
    expect(request.url).toBe("/wp-admin/admin-ajax.php");
    expect(request.sentBody).toContain("action=kotlinskidev_track_page_view");
    expect(request.sentBody).toContain("nonce=abc123");
  });

  it("logs an error when the AJAX response is not valid JSON", () => {
    setAjaxGlobal();
    loadWithPostId(21);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    jest.advanceTimersByTime(10000);
    MockXHR.instances[0].respond(200, "not-json{");

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("21"));
    errorSpy.mockRestore();
  });
});
