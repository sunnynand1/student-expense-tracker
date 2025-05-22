const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  
  Object.assign(fallback, {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify"),
    "url": require.resolve("url"),
    "zlib": require.resolve("browserify-zlib"),
    "process": require.resolve("process/browser")
  });
  
  config.resolve.fallback = fallback;
  
  // Add process and Buffer polyfills
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]);

  // Add source map support
  config.devtool = 'source-map';
  
  // Add resolve.alias for process
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': require.resolve('process/browser')
  };
  
  // Configure module rules for source maps
  config.module.rules.push({
    test: /\.m?js$/,
    enforce: 'pre',
    use: ['source-map-loader']
  });
  
  // Ignore warnings about source maps
  config.ignoreWarnings = [/Failed to parse source map/];
  
  return config;
};
