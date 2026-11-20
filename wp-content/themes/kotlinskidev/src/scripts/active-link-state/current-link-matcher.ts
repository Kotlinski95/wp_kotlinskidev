const UNSUPPORTED_SCHEME_PATTERN = /^(javascript|mailto|tel):/i;

export const normalizePath = (path: string): string => path.replace(/\/+$/, "") || "/";

const parseSameOriginUrl = (href: string): URL | null => {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin ? url : null;
  } catch {
    return null;
  }
};

export const createCurrentLinkMatcher =
  (currentPath: string) =>
  (href: string): boolean => {
    const trimmed = href.trim();

    if (trimmed === "" || trimmed === "#") {
      return false;
    }
    if (UNSUPPORTED_SCHEME_PATTERN.test(trimmed) || trimmed.includes("#")) {
      return false;
    }

    const url = parseSameOriginUrl(trimmed);
    return url !== null && normalizePath(url.pathname) === currentPath;
  };
