declare let __webpack_public_path__: string;

const themeUrl = (window as unknown as { kotlinskiTheme?: { themeUrl?: string } }).kotlinskiTheme
  ?.themeUrl;

if (themeUrl) {
  __webpack_public_path__ = `${themeUrl}/build/`;
}

export {};
