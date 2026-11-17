const fs = require("fs");
const path = require("path");
const defaults = require("@wordpress/scripts/config/webpack.config");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DependencyExtractionWebpackPlugin = require("@wordpress/dependency-extraction-webpack-plugin");
const RtlCssPlugin = require("@wordpress/scripts/plugins/rtlcss-webpack-plugin");
const NestedRtlCssPlugin = require("./bin/webpack/nested-rtlcss-plugin");

const srcDir = path.resolve(process.cwd(), "src");
const blocksDir = path.join(srcDir, "blocks");

const blockDirsBundledElsewhere = new Set();
for (const bundleFile of ["editor.ts", "index.ts"]) {
  const contents = fs.readFileSync(path.join(srcDir, bundleFile), "utf8");
  const importRe = /import\s+(?:[\w{}, *]+\s+from\s+)?"\.\/blocks\/([^"]+)"/g;
  let match;
  while ((match = importRe.exec(contents))) {
    blockDirsBundledElsewhere.add(match[1].replace(/\/index(\.tsx?)?$/, ""));
  }
}

const coreEntries = {
  main: path.join(srcDir, "index.ts"),
  critical: path.join(srcDir, "critical.ts"),
  "critical-certificate": path.join(srcDir, "critical-certificate.ts"),
  "critical-search": path.join(srcDir, "critical-search.ts"),
  editor: path.join(srcDir, "editor.ts"),
  "main-all": path.join(srcDir, "editor-content.scss"),
  "admin-bar": path.join(srcDir, "admin-bar.ts"),
  "canvas-background-init": path.join(srcDir, "scripts/canvas-background/init.ts"),
};

const blockStyleRegistry = JSON.parse(
  fs.readFileSync(path.join(srcDir, "block-styles.json"), "utf8")
);
const blockStyleEntries = {};
for (const [handle, definition] of Object.entries(blockStyleRegistry)) {
  blockStyleEntries[`blocks/${handle}`] = []
    .concat(definition.src)
    .map((file) => path.resolve(process.cwd(), file));
}

const cssOnlyScriptAsset = /^js\/(blocks\/.+|main-all)(\.js|\.asset\.php)$/;

class DropCssOnlyScriptsPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("DropCssOnlyScriptsPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "DropCssOnlyScriptsPlugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        (assets) => {
          for (const name of Object.keys(assets)) {
            if (cssOnlyScriptAsset.test(name)) {
              compilation.deleteAsset(name);
            }
          }
        }
      );
    });
  }
}

const blockEntries = {};
for (const blockName of fs.readdirSync(blocksDir)) {
  const blockPath = path.join(blocksDir, blockName);
  if (!fs.statSync(blockPath).isDirectory()) {
    continue;
  }

  const files = fs.readdirSync(blockPath);
  let indexFile = null;
  if (files.includes("index.tsx")) {
    indexFile = "index.tsx";
  } else if (files.includes("index.ts")) {
    indexFile = "index.ts";
  }

  if (indexFile && !blockDirsBundledElsewhere.has(blockName)) {
    blockEntries[blockName] = path.join(blockPath, indexFile);
  }
  if (files.includes("init.ts")) {
    blockEntries[`${blockName}-init`] = path.join(blockPath, "init.ts");
  }
  if (files.includes("panel.tsx")) {
    blockEntries[`${blockName}-panel`] = path.join(blockPath, "panel.tsx");
  }
}

const nestedOutputPlugins = defaults.plugins
  .filter(Boolean)
  .filter(
    (plugin) =>
      !(plugin instanceof MiniCssExtractPlugin) &&
      !(plugin instanceof RtlCssPlugin) &&
      !(plugin instanceof DependencyExtractionWebpackPlugin)
  )
  .concat([
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[name].css?v=[contenthash]",
    }),
    new NestedRtlCssPlugin(),
    new DropCssOnlyScriptsPlugin(),
    new DependencyExtractionWebpackPlugin({ outputFilename: "js/[name].asset.php" }),
  ]);

module.exports = {
  ...defaults,

  devtool: process.env.KOTLINSKIDEV_SOURCEMAPS ? "source-map" : defaults.devtool,

  entry: {
    ...coreEntries,
    ...blockEntries,
    ...blockStyleEntries,
  },

  module: {
    ...defaults.module,
    rules: [
      { test: /[\\/]node_modules[\\/]swiper[\\/].*\.m?js$/, sideEffects: false },
      ...defaults.module.rules,
    ],
  },

  plugins: nestedOutputPlugins,

  optimization: {
    ...defaults.optimization,
    splitChunks: {
      ...defaults.optimization.splitChunks,
      cacheGroups: {
        ...defaults.optimization.splitChunks.cacheGroups,
        dompurify: {
          test: /[\\/]node_modules[\\/]dompurify[\\/]/,
          name: "dompurify",
          chunks: "async",
          enforce: true,
          priority: 20,
        },
        swiperEffect: {
          test: /[\\/]node_modules[\\/]swiper[\\/]modules[\\/]effect-(fade|cube|coverflow|flip|cards)\.m?js$/,
          name: (module) => {
            const match = /effect-(fade|cube|coverflow|flip|cards)\.m?js$/.exec(
              module.resource ?? ""
            );
            return `swiper-effect-${match ? match[1] : "shared"}`;
          },
          chunks: "async",
          enforce: true,
          priority: 30,
        },
        swiper: {
          test: /[\\/]node_modules[\\/]swiper[\\/]/,
          name: "swiper",
          chunks: "async",
          enforce: true,
          priority: 20,
        },
      },
    },
  },

  output: {
    ...defaults.output,
    filename: "js/[name].js",
    chunkFilename: "js/[name].js?v=[chunkhash]",
    path: path.resolve(process.cwd(), "build"),
  },
  resolve: {
    ...defaults.resolve,
    alias: {
      ...defaults.resolve.alias,
      "@node_modules": `${__dirname}/node_modules`,
      "@utils": path.resolve(__dirname, "src/utils"),
      "@assets": path.resolve(__dirname, "assets"),
    },
  },
};
