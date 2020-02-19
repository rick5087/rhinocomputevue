const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    configureWebpack: {
      output: {
          publicPath: "/"
        },
      plugins: [ 
          new CopyWebpackPlugin([ { from: 'node_modules/rhino3dm/rhino3dm.wasm', to: 'js/' } ]) 
        ],
    }
}