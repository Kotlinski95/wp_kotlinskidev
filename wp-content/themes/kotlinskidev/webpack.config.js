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
  editor: path.join(srcDir, "editor.ts"),
  "admin-bar": path.join(srcDir, "admin-bar.ts"),
};

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
    new MiniCssExtractPlugin({ filename: "css/[name].css" }),
    new NestedRtlCssPlugin(),
    new DependencyExtractionWebpackPlugin({ outputFilename: "js/[name].asset.php" }),
  ]);

module.exports = {
  ...defaults,

  devtool: process.env.KOTLINSKIDEV_SOURCEMAPS ? "source-map" : defaults.devtool,

  entry: {
    ...coreEntries,
    ...blockEntries,
  },

  plugins: nestedOutputPlugins,

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
