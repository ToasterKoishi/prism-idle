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
        test: /\.s[ac]ss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.json$/,
        type: 'json'
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        type: "asset/resource"
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
    publicPath: "./dist/",
    filename: "bundle.js"
  },
  devServer: {
    port: 3000,
    static: {
      directory: path.join(__dirname, "/"),
    },
    devMiddleware: {
      publicPath: "http://localhost:3000/dist/"
    },
    hot: true
  }
};