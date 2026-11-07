import { isLocalContentReady, toggleFeaturedProject, updateFaqPair } from "./readiness";

describe("isLocalContentReady", () => {
  it("is not ready without an intro", () => {
    expect(isLocalContentReady({ local_audience: "Agencies" })).toBe(false);
    expect(isLocalContentReady(undefined)).toBe(false);
  });

  it("is not ready with only an intro", () => {
    expect(isLocalContentReady({ local_intro: "Hello" })).toBe(false);
  });

  it("is ready with an intro and any supporting field", () => {
    expect(isLocalContentReady({ local_intro: "Hi", local_audience: "SMEs" })).toBe(true);
    expect(isLocalContentReady({ local_intro: "Hi", local_distance: "30 min" })).toBe(true);
    expect(isLocalContentReady({ local_intro: "Hi", featured_projects: [4] })).toBe(true);
    expect(
      isLocalContentReady({ local_intro: "Hi", local_faq: [{ question: "Q", answer: "A" }] })
    ).toBe(true);
  });

  it("ignores half-filled FAQ pairs and whitespace", () => {
    expect(
      isLocalContentReady({ local_intro: "Hi", local_faq: [{ question: "Q", answer: " " }] })
    ).toBe(false);
    expect(isLocalContentReady({ local_intro: "  ", local_audience: "x" })).toBe(false);
  });
});

describe("toggleFeaturedProject", () => {
  it("adds up to three and removes on uncheck", () => {
    expect(toggleFeaturedProject([1, 2, 3], 4, true)).toEqual([1, 2, 3]);
    expect(toggleFeaturedProject([1, 2], 3, true)).toEqual([1, 2, 3]);
    expect(toggleFeaturedProject([1, 2, 3], 2, false)).toEqual([1, 3]);
    expect(toggleFeaturedProject([1], 1, true)).toEqual([1]);
  });
});

describe("updateFaqPair", () => {
  it("always returns two pairs and patches one", () => {
    expect(updateFaqPair([], 1, { question: "Q" })).toEqual([
      { question: "", answer: "" },
      { question: "Q", answer: "" },
    ]);
  });
});
