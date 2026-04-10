import { Platform } from 'react-native';

// API configuration
// Prefer setting EXPO_PUBLIC_API_URL in your environment for devices/emulators
// Fallback is localhost which works for web and iOS simulator
// For Android emulator, use 10.0.2.2
const localhost = Platform.select({
    android: '10.0.2.2',
    default: 'localhost',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${localhost}:8000`;

