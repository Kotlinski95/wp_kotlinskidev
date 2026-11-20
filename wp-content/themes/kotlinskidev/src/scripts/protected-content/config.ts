export interface ProtectionConfig {
  ajaxUrl: string;
  nonce: string;
  errorText: string;
  themeUrl?: string;
}

export interface ProtectionApi {
  decryptText: (encryptedText: string, type?: string) => Promise<string>;
  processProtectedElements: () => void;
  processElement: (element: HTMLElement) => void;
  initProtection: () => void;
}

declare global {
  interface Window {
    kotlinskidevProtectionConfig?: ProtectionConfig;
    kotlinskidevProtection?: ProtectionApi;
  }
}

const DEFAULT_THEME_URL = "/wp-content/themes/kotlinskidev";

export const getConfig = (): ProtectionConfig => {
  if (!window.kotlinskidevProtectionConfig) {
    window.kotlinskidevProtectionConfig = {
      ajaxUrl: "/wp-admin/admin-ajax.php",
      nonce: "",
      errorText: "Failed to load protected content",
    };
  }

  return window.kotlinskidevProtectionConfig;
};

export const getThemeUrl = (): string =>
  window.kotlinskidevProtectionConfig?.themeUrl || DEFAULT_THEME_URL;
