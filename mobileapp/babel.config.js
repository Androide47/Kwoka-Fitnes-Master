module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Hermes does not support `import.meta` (used by zustand ESM / devtools middleware).
          native: {
            unstable_transformImportMeta: true,
          },
        },
      ],
    ],
    plugins: [],
  };
};
