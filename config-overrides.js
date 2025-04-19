// This file adds polyfills to allow the web app to work with PSFFPP

const webpack = require('webpack')

module.exports = function override (config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    buffer: require.resolve('buffer-browserify'),
    vm: require.resolve('vm-browserify'),
    stream: require.resolve('stream-browserify'),
    url: false,
    Buffer: false
  }

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ])

  return config
}
