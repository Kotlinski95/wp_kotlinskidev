import { registerFormatType } from "@wordpress/rich-text";
import type { RichTextValue } from "@wordpress/rich-text";

jest.mock("@wordpress/rich-text", () => {
  const actual = jest.requireActual("@wordpress/rich-text");
  return { ...actual, registerFormatType: jest.fn() };
});

jest.mock("@wordpress/block-editor", () => ({ RichTextToolbarButton: () => null }));
jest.mock("@wordpress/components", () => ({
  Popover: () => null,
  SelectControl: () => null,
  Button: () => null,
  Notice: () => null,
}));
jest.mock("@wordpress/api-fetch", () => ({ __esModule: true, default: jest.fn() }));

import {
  OFFER_FORMAT,
  findFormatRun,
  insertOfferValue,
  isSelectionComplete,
  OfferValueButton,
} from "./index";

const selection = { offer: "website", variant: "landing", field: "price" };

function emptyValue(text: string, start: number, end: number): RichTextValue {
  return {
    text,
    formats: Array.from({ length: text.length }, () => undefined),
    replacements: Array.from({ length: text.length }, () => undefined),
    start,
    end,
  } as unknown as RichTextValue;
}

describe("kotlinskidev/offer-value format", () => {
  it("registers the format with the three data attributes", () => {
    expect(registerFormatType).toHaveBeenCalledWith(
      OFFER_FORMAT,
      expect.objectContaining({
        tagName: "span",
        className: "kt-offer",
        attributes: {
          offer: "data-kt-offer",
          variant: "data-kt-variant",
          field: "data-kt-field",
        },
        edit: OfferValueButton,
      })
    );
  });

  it("inserts the resolved value formatted with the selection attributes", () => {
    const result = insertOfferValue(emptyValue("Cost: ", 6, 6), selection, {
      value: "from €250",
      placeholder: false,
    });
    expect(result).not.toBeNull();
    expect(result?.text).toBe("Cost: from €250");
    const formats = result?.formats as { type: string; attributes: Record<string, string> }[][];
    expect(formats[6][0]).toEqual({
      type: OFFER_FORMAT,
      attributes: { offer: "website", variant: "landing", field: "price" },
    });
    expect(formats[5]).toBeUndefined();
    expect(formats[14][0].type).toBe(OFFER_FORMAT);
  });

  it("returns null for an unresolved or empty value", () => {
    const value = emptyValue("abc", 3, 3);
    expect(insertOfferValue(value, selection, null)).toBeNull();
    expect(insertOfferValue(value, selection, { value: "", placeholder: false })).toBeNull();
    expect(
      insertOfferValue(value, { ...selection, variant: "" }, { value: "x", placeholder: false })
    ).toBeNull();
  });

  it("replaces an existing format run when one is supplied", () => {
    const first = insertOfferValue(emptyValue("A ", 2, 2), selection, {
      value: "old",
      placeholder: false,
    }) as RichTextValue;
    const caretInside = { ...first, start: 3, end: 3 } as RichTextValue;
    const run = findFormatRun(caretInside);
    expect(run).toEqual({ start: 2, end: 5 });
    const second = insertOfferValue(
      caretInside,
      selection,
      { value: "new value", placeholder: false },
      run
    );
    expect(second?.text).toBe("A new value");
  });

  it("detects an incomplete selection", () => {
    expect(isSelectionComplete(selection)).toBe(true);
    expect(isSelectionComplete({ ...selection, offer: "" })).toBe(false);
  });
});
