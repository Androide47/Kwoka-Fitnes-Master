# Metro / Expo Router

The `ENOENT` on paths like `app?ctx=…` is handled in `metro.config.js` by setting `maxWorkers: 1`, so the context-module template buffer is not lost across Jest worker IPC.

Do not patch Metro in `node_modules` unless you have a maintained `patch-package` setup; prefer the config fix above.
