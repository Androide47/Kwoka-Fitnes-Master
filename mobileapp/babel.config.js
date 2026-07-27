module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Zustand ESM (and similar) emit `import.meta`, but Expo web static HTML
          // loads the bundle as a classic <script defer> — not type="module".
          // Transform it away for both native (Hermes) and web.
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [],
  };
};
