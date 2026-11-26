const mockLoaded: string[] = [];

jest.mock("swiper/css", () => mockLoaded.push("base"), { virtual: true });
jest.mock("swiper/css/navigation", () => mockLoaded.push("navigation"), { virtual: true });
jest.mock("swiper/css/pagination", () => mockLoaded.push("pagination"), { virtual: true });
jest.mock("swiper/css/scrollbar", () => mockLoaded.push("scrollbar"), { virtual: true });
jest.mock("swiper/css/effect-fade", () => mockLoaded.push("fade"), { virtual: true });
jest.mock("swiper/css/effect-cube", () => mockLoaded.push("cube"), { virtual: true });
jest.mock("swiper/css/effect-coverflow", () => mockLoaded.push("coverflow"), { virtual: true });
jest.mock("swiper/css/effect-flip", () => mockLoaded.push("flip"), { virtual: true });
jest.mock("swiper/css/effect-cards", () => mockLoaded.push("cards"), { virtual: true });

import { loadSwiperStyles } from "./loadSwiperStyles";

describe("loadSwiperStyles", () => {
  beforeEach(() => {
    mockLoaded.length = 0;
    jest.resetModules();
  });

  it("loads only the base, navigation and pagination styles for the default slide effect", async () => {
    await loadSwiperStyles({});
    expect([...mockLoaded].sort()).toEqual(["base", "navigation", "pagination"]);
  });

  it("adds the scrollbar style when the scrollbar is shown", async () => {
    await loadSwiperStyles({ showScrollbar: true });
    expect(mockLoaded).toContain("scrollbar");
  });

  it("adds only the style of the selected transition effect", async () => {
    await loadSwiperStyles({ transitionEffect: "fade" });
    expect(mockLoaded).toContain("fade");
    expect(mockLoaded).not.toContain("cube");
  });
});
