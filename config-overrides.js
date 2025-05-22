const { override, addWebpackModuleRule, addWebpackPlugin, addWebpackResolve, addWebpackAlias } = require('customize-cra');
const webpack = require('webpack');
const path = require('path');

module.exports = override(
  // Add support for CSS and PostCSS
  (config) => {
    // Remove the default CSS loader
    const rules = config.module.rules.find(rule => Array.isArray(rule.oneOf))?.oneOf || [];
    const cssRuleIndex = rules.findIndex(rule => 
      rule.test && rule.test.toString().includes('css')
    );
    
    if (cssRuleIndex !== -1) {
      rules.splice(cssRuleIndex, 1);
    }

    // Add our custom CSS/PostCSS loaders
    rules.unshift(
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { 
            loader: 'css-loader', 
            options: { 
              importLoaders: 1,
              url: true,
              sourceMap: true
            } 
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              postcssOptions: {
                config: true
              }
            }
          }
        ],
        sideEffects: true
      }
    );

    return config;
  },
  
  // Add fallbacks for Node.js core modules
  addWebpackResolve({
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify"),
      "url": require.resolve("url"),
      "buffer": require.resolve("buffer"),
      "process": require.resolve("process/browser"),
    },
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: {
      'process/browser': require.resolve('process/browser')
    }
  }),
  
  // Add global variables
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ),
  
  // Add DefinePlugin for process.env
  (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env': '{}',
        'process.browser': true,
        global: 'window',
      })
    );
    
    // Configure source maps
    config.devtool = 'source-map';
    
    // Add source map loader
    config.module.rules.push({
      test: /\.m?js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
      exclude: [
        path.join(process.cwd(), 'node_modules')
      ]
    });
    
    // Ignore source map warnings
    config.ignoreWarnings = [/Failed to parse source map/];
    
    return config;
  }
);
