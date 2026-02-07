// =============================================================================
// GLOBAL TRANSLATION INTERFACES
// =============================================================================

export interface NavigationTranslations {
  menu: {
    toggle: string;
    close: string;
    open: string;
  };
  breadcrumbs: {
    home: string;
    you_are_here: string;
  };
  pagination: {
    prev: string;
    next: string;
    page: string;
    of: string;
  };
}

export interface FormTranslations {
  validation: {
    required: string;
    email_invalid: string;
    min_length: string;
    max_length: string;
  };
  messages: {
    sending: string;
    success: string;
    error: string;
  };
  buttons: {
    submit: string;
    send: string;
    cancel: string;
    save: string;
  };
}

export interface GeneralTranslations {
  loading: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  close: string;
  read_more: string;
  read_less: string;
  show_more: string;
  show_less: string;
}

export interface AccessibilityTranslations {
  skip_to_content: string;
  scroll_to_top: string;
  external_link: string;
  new_window: string;
  download: string;
}

export interface CookieConsentTranslations {
  message: string;
  accept: string;
  decline: string;
  learn_more: string;
  settings: string;
}

export interface LightboxTranslations {
  close: string;
  next: string;
  prev: string;
  loading: string;
  counter: string;
}

export interface ScrollAnimationsTranslations {
  reveal: string;
  animated: string;
}

export interface KotlinskiDevTranslations {
  navigation: NavigationTranslations;
  forms: FormTranslations;
  general: GeneralTranslations;
  accessibility: AccessibilityTranslations;
  cookieConsent: CookieConsentTranslations;
  lightbox: LightboxTranslations;
  scrollAnimations: ScrollAnimationsTranslations;
}

// =============================================================================
// GLOBAL WINDOW INTERFACE EXTENSIONS
// =============================================================================

declare global {
  interface Window {
    kotlinskiDevL10n?: KotlinskiDevTranslations;

    wpApiSettings?: {
      root: string;
      nonce: string;
    };

    kotlinskiDevConfig?: {
      ajaxUrl: string;
      homeUrl: string;
      themeUrl: string;
      isAdmin: boolean;
      userId: number | null;
    };
  }
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type EventCallback = (event: Event) => void;
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;

export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Rect extends Point, Dimensions {}

export type DeviceType = "mobile" | "tablet" | "desktop";
export type ThemeMode = "light" | "dark" | "auto";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getTranslations = (): KotlinskiDevTranslations => {
  return (
    window.kotlinskiDevL10n || {
      networkStatus: {
        offline: {
          icon: "📱",
          message: "You are offline. Some features may be limited.",
        },
        slow: {
          icon: "🐌",
          message: "Slow internet connection detected. Content may load slowly.",
        },
        online: { icon: "✅", message: "Connection restored!" },
        aria: {
          status_label: "Network connection status",
          close_label: "Close network status notification",
        },
      },
      navigation: {
        menu: {
          toggle: "Toggle navigation menu",
          close: "Close menu",
          open: "Open menu",
        },
        breadcrumbs: { home: "Home", you_are_here: "You are here:" },
        pagination: { prev: "Previous", next: "Next", page: "Page", of: "of" },
      },
      forms: {
        validation: {
          required: "This field is required.",
          email_invalid: "Please enter a valid email address.",
          min_length: "Minimum length is %d characters.",
          max_length: "Maximum length is %d characters.",
        },
        messages: {
          sending: "Sending...",
          success: "Message sent successfully!",
          error: "An error occurred. Please try again.",
        },
        buttons: {
          submit: "Submit",
          send: "Send",
          cancel: "Cancel",
          save: "Save",
        },
      },
      general: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Information",
        close: "Close",
        read_more: "Read more",
        read_less: "Read less",
        show_more: "Show more",
        show_less: "Show less",
      },
      accessibility: {
        skip_to_content: "Skip to main content",
        scroll_to_top: "Scroll to top",
        external_link: "External link",
        new_window: "Opens in new window",
        download: "Download file",
      },
      cookieConsent: {
        message: "This website uses cookies to ensure you get the best experience on our website.",
        accept: "Accept",
        decline: "Decline",
        learn_more: "Learn more",
        settings: "Cookie Settings",
      },
      lightbox: {
        close: "Close lightbox",
        next: "Next image",
        prev: "Previous image",
        loading: "Loading image...",
        counter: "%1$d of %2$d",
      },
      scrollAnimations: {
        reveal: "Content revealed",
        animated: "Animation triggered",
      },
    }
  );
};

export const getTranslationGroup = <K extends keyof KotlinskiDevTranslations>(
  group: K
): KotlinskiDevTranslations[K] => {
  return getTranslations()[group];
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func(...args);
    }, wait);

    if (callNow) func(...args);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const isElementInViewport = (el: Element): boolean => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const getDeviceType = (): DeviceType => {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

export const prefersReducedMotion = (): boolean => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const getThemePreference = (): ThemeMode => {
  const saved = localStorage.getItem("theme-preference") as ThemeMode;
  if (saved) return saved;

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
};

export const formatString = (str: string, ...args: (string | number)[]): string => {
  return str.replace(/%(\d+)\$?[sd]/g, (match, index) => {
    const argIndex = parseInt(index) - 1;
    return args[argIndex]?.toString() || match;
  });
};

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes: Partial<HTMLElementTagNameMap[K]> & { [key: string]: any } = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith("data-") || key.startsWith("aria-")) {
      element.setAttribute(key, String(value));
    } else if (key in element) {
      (element as any)[key] = value;
    }
  });

  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });

  return element;
};

export const domReady = (callback: VoidCallback): void => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};
export class EventEmitter {
  private events: { [key: string]: Array<(...args: any[]) => void> } = {};

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(...args));
  }
}
