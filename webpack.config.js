const path = require("path");

module.exports = [
  {
    // CommonJS Configuration
    mode: "production",
    entry: "./src/exboost.ts",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "exboost.cjs",
      path: path.resolve(__dirname, "dist"),
      libraryTarget: "commonjs2",
    },
    target: "node", // Optimize the bundle for Node.js
    optimization: {
      minimize: true, // Optional: Disable minimization for debugging purposes
    },
  },
  {
    // ES Module Configuration
    mode: "production",
    entry: "./src/exboost.ts",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "exboost.mjs",
      path: path.resolve(__dirname, "dist"),
      library: {
        type: "module",
      },
    },
    experiments: {
      outputModule: true,
    },
    target: "web",
    optimization: {
      minimize: true,
    },
  },
];
