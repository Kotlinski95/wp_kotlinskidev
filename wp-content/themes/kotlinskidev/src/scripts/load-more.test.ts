function loadScript() {
  jest.resetModules();
  require("./load-more");
}

describe("load-more.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when there is no load-more container on the page", () => {
    document.body.innerHTML = "<p>no cards here</p>";

    expect(() => loadScript()).not.toThrow();
  });

  it("does nothing when children count does not exceed the initial limit", () => {
    document.body.innerHTML = '<div data-kt-load-more-initial="3"><div>a</div><div>b</div></div>';

    loadScript();

    expect(document.querySelector(".kt-load-more__button")).not.toBeInTheDocument();
  });

  it("hides children beyond the initial count and inserts a button", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="2"><div>a</div><div>b</div><div>c</div><div>d</div></div>';

    loadScript();

    const children = Array.from(document.querySelectorAll("[data-kt-load-more-initial] > div"));
    expect(children[0]).not.toHaveClass("kt-load-more-hidden");
    expect(children[1]).not.toHaveClass("kt-load-more-hidden");
    expect(children[2]).toHaveClass("kt-load-more-hidden");
    expect(children[3]).toHaveClass("kt-load-more-hidden");

    const button = document.querySelector(".kt-load-more__button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Load more");
  });

  it("uses the custom label from the data attribute when present", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" data-kt-load-more-label="Pokaż więcej"><div>a</div><div>b</div></div>';

    loadScript();

    expect(document.querySelector(".kt-load-more__button")).toHaveTextContent("Pokaż więcej");
  });

  it("reveals the hidden children and removes the button on click", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1"><div>a</div><div>b</div><div>c</div></div>';

    loadScript();

    const button = document.querySelector<HTMLButtonElement>(".kt-load-more__button")!;
    button.click();

    const hidden = document.querySelectorAll(".kt-load-more-hidden");
    expect(hidden).toHaveLength(0);
    expect(document.querySelector(".kt-load-more__button")).not.toBeInTheDocument();
  });

  it("ignores an invalid or missing initial count", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="not-a-number"><div>a</div><div>b</div></div>';

    loadScript();

    expect(document.querySelector(".kt-load-more__button")).not.toBeInTheDocument();
  });
});
