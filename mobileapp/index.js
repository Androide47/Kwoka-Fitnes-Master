/**
 * Custom entry point to work around Metro context module ENOENT with expo-router.
 * Uses require.context('./app') from project root instead of expo-router/_ctx.
 */
import '@expo/metro-runtime';
import React from 'react';
import { ExpoRoot } from 'expo-router/build/ExpoRoot';
import { Head } from 'expo-router/build/head';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import 'expo-router/build/fast-refresh';

// Same pattern as expo-router _ctx – match app routes, exclude +api and +html
const ctx = require.context(
  './app',
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+html)))\.[tj]sx?$).*(?:\.android|\.web)?\.[tj]sx?$/
);

function App() {
  return React.createElement(
    Head.Provider,
    null,
    React.createElement(ExpoRoot, { context: ctx })
  );
}

renderRootComponent(App);
