import { initDropdownPanels } from "@utils/dropdown-panel";

jest.mock("@utils/dropdown-panel", () => ({ initDropdownPanels: jest.fn() }));

import "./language-panel";

describe("language-panel", () => {
  it("initializes the language dropdown panel once the DOM is ready", () => {
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(initDropdownPanels).toHaveBeenCalledWith({
      rootSelector: ".kt-lang-panel",
      triggerSelector: ".kt-lang-panel__trigger",
      modalSelector: ".kt-lang-panel__modal",
    });
  });
});
