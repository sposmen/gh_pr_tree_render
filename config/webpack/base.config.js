const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");

module.exports = {
  entry: {
    entry: path.resolve(__dirname, '../../assets/src/index.js')
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, '../../.tmp/public'),
    filename: 'bundle-[hash].js'
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, '../../assets/src')
    },
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/
      },
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'assets/src/index.html' })
  ]
};
