import { createContext } from "react";

export interface ContentTabsPortalValue {
  navSlotEl: HTMLElement | null;
  panelsSlotEl: HTMLElement | null;
  activeItemClientId: string | null;
}

export const ContentTabsPortalContext = createContext<ContentTabsPortalValue | null>(null);
