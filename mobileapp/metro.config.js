const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Expo Router uses Metro `require.context` virtual modules (`app?ctx=…`). With
// multiple Jest worker processes, the in-memory template buffer can fail to
// round-trip over IPC, so the worker tries to read that path from disk → ENOENT.
config.maxWorkers = 1;

// One physical copy of React Navigation in the bundle. Duplicate instances break
// React context (e.g. PreventRemoveContext → "Couldn't find the prevent remove context").
const reactNavigationPackages = [
  '@react-navigation/native',
  '@react-navigation/core',
  '@react-navigation/elements',
  '@react-navigation/bottom-tabs',
  '@react-navigation/native-stack',
  '@react-navigation/routers',
];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...Object.fromEntries(
    reactNavigationPackages.map((name) => [name, path.join(projectRoot, 'node_modules', name)])
  ),
};

module.exports = config;
