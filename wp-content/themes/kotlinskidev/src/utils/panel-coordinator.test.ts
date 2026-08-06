import { registerPanel, closeAllExcept } from "./panel-coordinator";

describe("panel-coordinator", () => {
  it("calls every registered handler when no exception is given", () => {
    const closeA = jest.fn();
    const closeB = jest.fn();
    registerPanel(closeA);
    registerPanel(closeB);

    closeAllExcept();

    expect(closeA).toHaveBeenCalledTimes(1);
    expect(closeB).toHaveBeenCalledTimes(1);
  });

  it("skips the handler passed as the current exception", () => {
    const closeA = jest.fn();
    const closeB = jest.fn();
    registerPanel(closeA);
    registerPanel(closeB);

    closeAllExcept(closeB);

    expect(closeA).toHaveBeenCalledTimes(1);
    expect(closeB).not.toHaveBeenCalled();
  });
});
