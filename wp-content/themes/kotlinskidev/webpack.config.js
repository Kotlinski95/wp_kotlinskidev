const path = require("path");
const defaults = require("@wordpress/scripts/config/webpack.config");

module.exports = {
  ...defaults,

  entry: {
    main: path.resolve(process.cwd(), "src", "index.ts"),
    critical: path.resolve(process.cwd(), "src", "critical.ts"),
    "banner-carousel": path.resolve(process.cwd(), "src", "blocks", "banner-carousel", "index.ts"),
    "gallery-lightbox": path.resolve(
      process.cwd(),
      "src",
      "blocks",
      "gallery-lightbox",
      "index.tsx"
    ),
    "gallery-lightbox-init": path.resolve(
      process.cwd(),
      "src",
      "blocks",
      "gallery-lightbox",
      "init.ts"
    ),
    "banner-carousel-init": path.resolve(
      process.cwd(),
      "src",
      "blocks",
      "banner-carousel",
      "init.ts"
    ),
    "hero-carousel": path.resolve(process.cwd(), "src", "blocks", "hero-carousel", "index.ts"),
    "hero-carousel-init": path.resolve(process.cwd(), "src", "blocks", "hero-carousel", "init.ts"),
    "scroll-section": path.resolve(process.cwd(), "src", "blocks", "scroll-section", "index.ts"),
    "scroll-section-init": path.resolve(
      process.cwd(),
      "src",
      "blocks",
      "scroll-section",
      "init.ts"
    ),
    "protected-content": path.resolve(
      process.cwd(),
      "src",
      "blocks",
      "protected-content",
      "index.tsx"
    ),
    editor: path.resolve(process.cwd(), "src", "editor.ts"),
    navigation: path.resolve(process.cwd(), "src", "blocks", "navigation", "index.tsx"),
    "theme-switcher": path.resolve(process.cwd(), "src", "blocks", "theme-switcher", "index.tsx"),
    "search-panel": path.resolve(process.cwd(), "src", "blocks", "search-panel", "index.tsx"),
    "popular-pages": path.resolve(process.cwd(), "src", "blocks", "popular-pages", "index.tsx"),
    "simple-grid": path.resolve(process.cwd(), "src", "blocks", "simple-grid", "index.ts"),
    "nav-content": path.resolve(process.cwd(), "src", "blocks", "nav-content", "index.tsx"),
  },

  output: {
    ...defaults.output,
    filename: "[name].js",
    chunkFilename: "[name].js?v=[chunkhash]",
    path: path.resolve(process.cwd(), "build"),
  },
  resolve: {
    ...defaults.resolve,
    alias: {
      ...defaults.resolve.alias,
      "@node_modules": `${__dirname}/node_modules`,
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
};
