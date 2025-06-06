const path = require('path');
const defaults = require('@wordpress/scripts/config/webpack.config');

module.exports = {
	...defaults,

	entry: {
		main: path.resolve(process.cwd(), 'src', 'index.ts'),
		critical: path.resolve(process.cwd(), 'src', 'critical.scss'),
		'banner-carousel': path.resolve(process.cwd(), 'src', 'blocks', 'banner-carousel', 'index.ts'),
	},

	output: {
		...defaults.output,
		filename: '[name].js',
		chunkFilename: '[name].js?v=[chunkhash]',
		path: path.resolve(process.cwd(), 'build'),
	},
	resolve: {
		...defaults.resolve,
		alias: {
			...defaults.resolve.alias,
			'@node_modules': `${__dirname}/node_modules`,
		},
	},
};