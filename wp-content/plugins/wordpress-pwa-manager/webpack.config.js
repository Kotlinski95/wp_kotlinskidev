const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig,
    entry: {
        admin: './src/admin/index.tsx',
        frontend: './src/frontend/index.ts',
    },
    resolve: {
        ...defaultConfig.resolve,
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
};
