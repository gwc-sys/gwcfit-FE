// Disable expo-router's react-navigation compatibility check.
// This app uses @react-navigation directly (not expo-router for routing),
// but expo-router is a transitive dependency of @expo/cli and cannot be removed.
process.env.EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK = "1";

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = /[/\\]\.pytest_cache(?:[/\\].*)?$/;
config.transformer.unstable_allowRequireContext = true;

module.exports = withNativeWind(config, {
  input: "./global.css"
});
