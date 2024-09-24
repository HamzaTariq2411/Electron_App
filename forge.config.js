const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require("path");

module.exports = {
  packagerConfig: {
    asar: true, // Enables ASAR packaging
    extraResources: [
      {
        from: path.join(__dirname, 'manifest.xml'),
        to: 'manifest.xml', // Includes extra resources like manifest.xml
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
   
        config: {
          name: 'your_app_name',
          // setupIcon: './assets/productivity.png',  // Optional: Custom icon for the installer
          setupExe: 'YourAppInstaller.exe',
          shortcutName: 'YourAppName',
          noMsi: true,  // Skip creating an MSI installer, which is often not needed
          createDesktopShortcut: true,  // Enable desktop shortcut creation
          createStartMenuShortcut: true,  // Enable Start Menu shortcut creation
        },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}, // Auto-unpack plugin for native modules
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js', // Main process webpack config
        renderer: {
          config: './webpack.renderer.config.js', // Renderer process webpack config
          entryPoints: [
            {
              html: './src/index.html', // Entry point for main window
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js', // Preload script for the main window
              },
            },
            {
              html: './src/dashboard/dashboard.html', // Entry point for child window
              js: './src/dashboard/dashboardRender.js',
              name: 'child_window',
              preload: {
                js: './src/preload.js', // Preload script for the child window
              },
            },
            {
              html: './src/login/login.html', // Entry point for login window
              js: './src/login/loginRender.js',
              name: 'login_window',
              preload: {
                js: './src/preload.js', // Preload script for the login window
              },
            },
            {
              html: './src/timeDelayScreen/timeDelay.html', // Entry point for delay window
              js: './src/timeDelayScreen/timeDelayRender.js',
              name: 'delay_window',
              preload: {
                js: './src/preload.js', // Preload script for the delay window
              },
            },
          ],
        },
      },
    },
    {
      name: '@timfish/forge-externals-plugin',
      config: {
        externals: [
          'node-global-key-listener', // External module for handling global key events
        ],
        includeDeps: true, // Includes dependencies in the bundle
      },
    },
    // Fuses plugin configuration for security features
    new FusesPlugin({
      version: FuseVersion.V1, // Fuse version 1
      [FuseV1Options.RunAsNode]: false, // Disable Node.js execution outside of Electron
      [FuseV1Options.EnableCookieEncryption]: true, // Enable cookie encryption for enhanced security
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, // Disable NODE_OPTIONS environment variable
      [FuseV1Options.EnableNodeCliInspectArguments]: false, // Disable --inspect CLI arguments for Node.js debugging
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true, // Enable ASAR file integrity checks
      [FuseV1Options.OnlyLoadAppFromAsar]: true, // Ensure the app can only be loaded from ASAR
    }),
  ],
};
