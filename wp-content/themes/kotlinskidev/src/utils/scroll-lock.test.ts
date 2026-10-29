import { lockScroll, unlockScroll } from "./scroll-lock";

describe("scroll-lock", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("has-modal-open");
  });

  it("adds the modal-open class when locked", () => {
    lockScroll("owner-a");

    expect(document.documentElement.classList.contains("has-modal-open")).toBe(true);
  });

  it("keeps the modal-open class while another owner still holds a lock", () => {
    lockScroll("owner-a");
    lockScroll("owner-b");

    unlockScroll("owner-a");

    expect(document.documentElement.classList.contains("has-modal-open")).toBe(true);
  });

  it("removes the modal-open class once every owner has unlocked", () => {
    lockScroll("owner-a");
    lockScroll("owner-b");

    unlockScroll("owner-a");
    unlockScroll("owner-b");

    expect(document.documentElement.classList.contains("has-modal-open")).toBe(false);
  });

  it("is a no-op when unlocking an owner that never locked", () => {
    unlockScroll("owner-never-locked");

    expect(document.documentElement.classList.contains("has-modal-open")).toBe(false);
  });
});
