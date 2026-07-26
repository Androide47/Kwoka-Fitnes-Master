const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => ({
  ...appJson,
  expo: {
    ...appJson.expo,
    web: {
      ...(appJson.expo.web ?? {}),
      output: 'static',
      bundler: 'metro',
      favicon: './assets/images/favicon.png',
    },
    experiments: {
      ...(appJson.expo.experiments ?? {}),
      // Set in CI for GitHub Pages subdirectory deploy, e.g. "/Kwoka-Fitnes-Master/app"
      baseUrl: process.env.EXPO_BASE_URL || '',
    },
  },
});
