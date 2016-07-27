var path = require('path')
var webpack = require('webpack')
var qs = require('qs')
var merge = require('webpack-merge')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var TARGET = process.env.npm_lifecycle_event

var common = {
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'Chat App' })
  ]
}

if (TARGET === 'start') {
  module.exports = merge(common, {
    devtool: 'source-map',
    entry: [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      'react-hot-loader/patch',
      './app/index'
    ],
    output: {
      publicPath: '/'
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: [
            'style',
            'css?modules&' + qs.stringify({
              importLoaders: 1,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            })
          ],
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  })
}

if (TARGET === 'build') {
  module.exports = merge(common, {
    devtool: 'cheap-module-source-map',
    entry: [
      './app/index'
    ],
    output: {
      publicPath: '/dist/'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'strip-loader?strip[]=console.log',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract(
            'style',
            'css?modules&' + qs.stringify({
              importLoaders: 1,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            })
          ),
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: true
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),
      new ExtractTextPlugin('styles.css')
    ]
  })
}
