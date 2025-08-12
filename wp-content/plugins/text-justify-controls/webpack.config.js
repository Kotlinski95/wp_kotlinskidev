const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
    ...defaultConfig,
    entry: {
        index: './src/index.tsx',
        'text-justify-controls': './src/style.scss'
    },
    output: {
        ...defaultConfig.output,
        path: require('path').resolve(__dirname, 'build')
    }
};
