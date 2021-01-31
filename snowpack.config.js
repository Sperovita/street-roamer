// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
    "node_modules/@fortawesome": {
      "url": "/webfonts",
      "static": true,
      "resolve": false
    }
  },
  plugins: [
    '@snowpack/plugin-vue', 
    '@snowpack/plugin-dotenv',
    // TODO: fix this hack to get font awesome working with snmowpack in prod. Or learn how the alias system works better and make it less of a hack
    // ['@snowpack/plugin-run-script', { "cmd": "ncp node_modules/@fortawesome/fontawesome-free/webfonts/ dist/webfonts" }]
  ],
  packageOptions: {
    polyfillNode: true
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
