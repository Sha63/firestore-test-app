const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: {
        app: './src/app.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
};