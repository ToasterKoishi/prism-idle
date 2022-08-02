const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: ["babel-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.json$/,
        type: 'json'
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        loader: "file-loader"
      }
    ]
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".tsx"],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, './'),
    ]
  },
  output: {
    path: path.resolve(__dirname, "dist/"),
    publicPath: "../dist/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    port: 3000,
    publicPath: "http://localhost:3000/dist/"
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
};