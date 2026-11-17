import { loadEffectModules } from "./effectModules";

jest.mock("swiper/modules", () => ({
  EffectFade: "EffectFade",
  EffectCube: "EffectCube",
  EffectCoverflow: "EffectCoverflow",
  EffectFlip: "EffectFlip",
  EffectCards: "EffectCards",
}));

describe("loadEffectModules", () => {
  it("loads nothing for the default slide effect or no effect", async () => {
    expect(await loadEffectModules("slide")).toEqual([]);
    expect(await loadEffectModules(undefined)).toEqual([]);
  });

  it.each([
    ["fade", "EffectFade"],
    ["cube", "EffectCube"],
    ["coverflow", "EffectCoverflow"],
    ["flip", "EffectFlip"],
    ["cards", "EffectCards"],
  ] as const)("loads only the %s module", async (effect, moduleName) => {
    expect(await loadEffectModules(effect)).toEqual([moduleName]);
  });

  it("ignores an unknown effect", async () => {
    expect(await loadEffectModules("spin" as never)).toEqual([]);
  });
});
