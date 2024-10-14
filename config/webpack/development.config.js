const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, '../../public'),
    },
    host: "localhost",
    compress: true,
    port: 9000,
    proxy: {
      '/api': 'http://localhost:1337',
    },
    historyApiFallback: {
      index: '/index.html'
    }
  },
}
