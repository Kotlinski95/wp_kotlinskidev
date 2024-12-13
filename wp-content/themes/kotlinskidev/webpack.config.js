const path = require( 'path' );
const defaults = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaults,

	entry: {
		main: path.resolve( process.cwd(), 'src', 'index.ts' ),
		critical: path.resolve( process.cwd(), 'src', 'critical.scss' ),
	},

	output: {
		...defaults.output,
		filename: '[name].js',
		chunkFilename: '[name].js?v=[chunkhash]',
		path: path.resolve( process.cwd(), 'build' ),
	},
};
