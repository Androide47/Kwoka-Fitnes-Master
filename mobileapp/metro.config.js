const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Expo Router uses Metro `require.context` virtual modules (`app?ctx=…`). With
// multiple Jest worker processes, the in-memory template buffer can fail to
// round-trip over IPC, so the worker tries to read that path from disk → ENOENT.
config.maxWorkers = 1;

module.exports = config;
