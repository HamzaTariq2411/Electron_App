const path = require('path');

// Import existing rules from another file, if applicable
const rules = require('./webpack.rules');

// Add rule for processing CSS files with Tailwind CSS and Autoprefixer
rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [require('tailwindcss'), require('autoprefixer')],
        },
      },
    },
  ],
});

module.exports = {
  // Put your normal Webpack config below here
  module: {
    rules, // Use the rules array including the new CSS rule
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Ensure that Webpack resolves .jsx files for React components
  },
  entry: './src/renderer.js', // Define the entry point for your renderer process
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.bundle.js', // Output bundle name for renderer
  },
  devtool: 'source-map', // Enable source maps
};
