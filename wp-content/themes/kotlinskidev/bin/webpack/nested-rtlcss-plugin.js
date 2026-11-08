/**
 * Forked from @wordpress/scripts's rtlcss-webpack-plugin (itself derived from
 * rtlcss-webpack-plugin, MIT, Copyright (c) 2018 Wix.com), changed only to
 * nest the generated *-rtl.css sibling under the same "css/" output directory
 * as its source file instead of the build root.
 */
const path = require("node:path");
const rtlcss = require("rtlcss");
const webpack = require("webpack");

const cssOnly = (filename) => path.extname(filename) === ".css";

class NestedRtlCssPlugin {
  processAssets = (compilation, callback) => {
    const chunks = Array.from(compilation.chunks);

    chunks.forEach((chunk) => {
      const files = Array.from(chunk.files);

      files.filter(cssOnly).forEach((filename) => {
        const src = compilation.assets[filename].source();
        const dst = rtlcss.process(src);
        const dstFileName = path.posix.join(
          path.posix.dirname(filename),
          compilation.getPath("[name]-rtl.css", { chunk, cssFileName: filename })
        );

        compilation.assets[dstFileName] = new webpack.sources.RawSource(dst);
        chunk.files.add(dstFileName);
      });
    });

    callback();
  };

  apply(compiler) {
    compiler.hooks.compilation.tap("NestedRtlCssPlugin", (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: "NestedRtlCssPlugin",
          stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        (chunks, callback) => this.processAssets(compilation, callback)
      );
    });
  }
}

module.exports = NestedRtlCssPlugin;
