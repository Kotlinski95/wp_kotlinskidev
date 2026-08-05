import type { KeyboardEvent } from "react";

export const onActivationKey =
  (handler: () => void) =>
  (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  };
