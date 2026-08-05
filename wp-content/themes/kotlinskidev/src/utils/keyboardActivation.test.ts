import { onActivationKey } from "./keyboardActivation";

const makeEvent = (key: string) =>
  ({
    key,
    preventDefault: jest.fn(),
  }) as unknown as React.KeyboardEvent;

describe("onActivationKey", () => {
  it("calls the handler and prevents default on Enter", () => {
    const handler = jest.fn();
    const event = makeEvent("Enter");

    onActivationKey(handler)(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("calls the handler and prevents default on Space", () => {
    const handler = jest.fn();
    const event = makeEvent(" ");

    onActivationKey(handler)(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("does not call the handler for any other key", () => {
    const handler = jest.fn();
    const event = makeEvent("Tab");

    onActivationKey(handler)(event);

    expect(handler).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
