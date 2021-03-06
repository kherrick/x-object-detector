const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { DefinePlugin } = require('webpack')

const config = require('./config')
const EsmWebpackPlugin = require('@purtuga/esm-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const contentBase = path.resolve(process.cwd())

module.exports = {
  devtool: 'cheap-module-source-map',
  devServer: {
    contentBase,
    contentBasePublicPath: '/'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      imgUrl: config.imgUrl,
      wasmPath: config.wasmPath,
      title: 'XObjectDetector',
      template: 'index.html'
    }),
    new DefinePlugin({
      'IMG_URL': JSON.stringify(config.imgUrl),
      'WASM_PATH': JSON.stringify(config.wasmPath),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  output: {
    filename: 'XObjectDetector.js',
    path: path.resolve(contentBase, 'dist')
  }
}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins.push(new EsmWebpackPlugin())

  module.exports.output.library = 'X_OBJECT_DETECTOR'
  module.exports.output.libraryTarget = 'var'
}
