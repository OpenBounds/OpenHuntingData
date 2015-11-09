
webpack = require('webpack')

module.exports = {
    entry: "./src/index.js",
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader"
        }]
    },
    output: {
        path: './dist/',
        filename: 'submission.js'
    }
};
