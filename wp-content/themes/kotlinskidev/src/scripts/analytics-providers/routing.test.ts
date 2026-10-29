import { providersForEvent } from "./routing";

describe("routing.ts", () => {
  it("routes an unlisted event to gtag only", () => {
    const providers = providersForEvent("cta_click");

    expect(providers.map((provider) => provider.id)).toEqual(["gtag"]);
  });

  it("routes generate_lead to both gtag and meta", () => {
    const providers = providersForEvent("generate_lead");

    expect(providers.map((provider) => provider.id)).toEqual(["gtag", "meta"]);
  });
});
