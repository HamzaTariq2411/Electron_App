const path = require("path");

module.exports = [
  // Add support for native node modules
  {
    // Native node module loader
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    // Loader for other node modules and JS files
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    // Babel loader for JSX and JS files
    test: /\.jsx?$/,
    exclude: /node_modules/,  // Move exclude here
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-react"],
      },
    },
  },
  {
    // Loader for CSS files
    test: /\.css$/,
    include: [path.resolve(__dirname, "app/src")],
    use: ["style-loader", "css-loader", "postcss-loader"],
  },
  // Additional rules can be added here, such as TypeScript, Sass, etc.
];
