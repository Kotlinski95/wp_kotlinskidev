const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'responsive-font-controls': './src/style.scss',
    'index': './src/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@wordpress/block-editor': ['wp', 'blockEditor'],
    '@wordpress/blocks': ['wp', 'blocks'],
    '@wordpress/element': ['wp', 'element'],
    '@wordpress/components': ['wp', 'components'],
    '@wordpress/hooks': ['wp', 'hooks'],
    '@wordpress/i18n': ['wp', 'i18n'],
    '@wordpress/compose': ['wp', 'compose'],
    '@wordpress/editor': ['wp', 'editor'],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  devtool: 'source-map',
};
