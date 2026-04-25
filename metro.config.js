const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure that we look for platform-specific extensions correctly
config.resolver.sourceExts = [...config.resolver.sourceExts, 'android.js', 'ios.js', 'mjs'];

module.exports = config;
