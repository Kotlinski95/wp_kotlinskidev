import {
  isValidEmail,
  isValidPhone,
  isValidTriggerAction,
  isValidUrl,
  labelContainsVisibleText,
} from "./validation";

describe("speed-dial validation", () => {
  it.each(["+48 123 456 789", "(22) 123-45-67", "123"])("accepts phone %s", (value) => {
    expect(isValidPhone(value)).toBe(true);
  });

  it.each(["", "ab", "call me"])("rejects phone %s", (value) => {
    expect(isValidPhone(value)).toBe(false);
  });

  it("validates email shape", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a b@c.d")).toBe(false);
  });

  it("accepts http, relative and hash urls and rejects javascript", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("/contact")).toBe(true);
    expect(isValidUrl("#top")).toBe(true);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("example.com")).toBe(false);
  });

  it("matches the trigger action grammar", () => {
    ["open", "profile:adhdFriendly", "feature:biggerText:2"].forEach((value) => {
      expect(isValidTriggerAction(value)).toBe(true);
    });
    ["Open", "feature:", "a:b:c:d", "<x>"].forEach((value) => {
      expect(isValidTriggerAction(value)).toBe(false);
    });
  });

  it("checks that the aria label contains the visible label", () => {
    expect(labelContainsVisibleText("Call us now", "call us")).toBe(true);
    expect(labelContainsVisibleText("Phone", "call us")).toBe(false);
  });
});
