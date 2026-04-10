# Metro patches for Expo Router context module fix

These patches fix the `ENOENT: no such file or directory, open '.../app?ctx=...'` error when bundling with Expo Router on iOS.

**Patches are already applied** in your current `node_modules`. They modify:

1. **formatBundlingError.js** – Skips reading "app?ctx=..." paths when formatting errors.
2. **Worker.flow.js** – Throws a clear error instead of ENOENT when a context module is transformed without a template buffer.
3. **Transformer.js** – Avoids _getSha1/getSource read on context paths; throws a clear error if no buffer.
4. **buildSubgraph.js** – Stores and looks up context by absolutePath as well as key so the template buffer is always passed (root-cause fix).

**After a fresh `bun install`:** patch-package does not support `bun.lock` yet. If the error returns, re-apply manually by copying the changes from this repo’s patch file into `node_modules/metro/`, or run `npx patch-package` if you have a `yarn.lock` or `package-lock.json` in the project.

**Always run with cache clear** when debugging this: `bun run dev` (which uses `expo start --clear`).
