import path from "path";
import type { StorybookConfig } from "@storybook/react-webpack5";

const SINGLETON_WORDPRESS_PACKAGES = ["data", "element"];

function dedupedWordpressPackageAliases(): Record<string, string> {
  const wordpressPackagesDir = path.resolve(process.cwd(), "node_modules/@wordpress");
  const aliases: Record<string, string> = {};
  for (const packageName of SINGLETON_WORDPRESS_PACKAGES) {
    aliases[`@wordpress/${packageName}`] = path.resolve(wordpressPackagesDir, packageName);
  }
  return aliases;
}

const config: StorybookConfig = {
  stories: ["../src/blocks/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-webpack5-compiler-swc"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  webpackFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      ...dedupedWordpressPackageAliases(),
      "@node_modules": path.resolve(process.cwd(), "node_modules"),
      "@utils": path.resolve(process.cwd(), "src/utils"),
      "@assets": path.resolve(process.cwd(), "assets"),
      "@wordpress/server-side-render$": path.resolve(process.cwd(), ".storybook/mock-server-side-render.tsx"),
    };

    config.module = config.module ?? { rules: [] };
    config.module.rules = config.module.rules ?? [];
    config.module.rules.push({
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"],
    });

    return config;
  },
};

export default config;
