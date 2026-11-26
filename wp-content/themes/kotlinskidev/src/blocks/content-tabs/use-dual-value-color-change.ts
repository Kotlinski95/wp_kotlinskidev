import { useRef } from "react";

export function useDualValueColorChange(
  onValue: (value: string) => void
): (value: string | undefined) => void {
  const pendingValueRef = useRef<string | null>(null);
  return (value) => {
    if (value !== undefined) {
      pendingValueRef.current = value;
      onValue(value);
    } else if (pendingValueRef.current !== null) {
      pendingValueRef.current = null;
    } else {
      onValue("");
    }
  };
}
