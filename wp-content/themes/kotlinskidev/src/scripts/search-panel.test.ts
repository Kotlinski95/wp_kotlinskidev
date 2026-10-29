import { initDropdownPanels } from "@utils/dropdown-panel";
import { trackEvent } from "./track-event";

jest.mock("@utils/dropdown-panel", () => ({ initDropdownPanels: jest.fn() }));
jest.mock("./track-event", () => ({ trackEvent: jest.fn() }));

import "./search-panel";

describe("search-panel", () => {
  it("initializes the search dropdown panel once the DOM is ready", () => {
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(initDropdownPanels).toHaveBeenCalledWith(
      expect.objectContaining({
        rootSelector: ".kt-search-panel",
        triggerSelector: ".kt-search-panel__trigger",
        modalSelector: ".kt-search-panel__modal",
      })
    );
  });

  it("focuses the search input when the panel opens", () => {
    document.dispatchEvent(new Event("DOMContentLoaded"));
    const { onOpen } = (initDropdownPanels as jest.Mock).mock.calls[0][0];

    const modal = document.createElement("div");
    const input = document.createElement("input");
    input.type = "search";
    modal.append(input);
    jest.spyOn(input, "focus");

    onOpen(modal);

    expect(input.focus).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith("search_panel_open");
  });

  it("does nothing when the modal has no search input", () => {
    document.dispatchEvent(new Event("DOMContentLoaded"));
    const { onOpen } = (initDropdownPanels as jest.Mock).mock.calls[0][0];

    const modal = document.createElement("div");

    expect(() => onOpen(modal)).not.toThrow();
  });
});
