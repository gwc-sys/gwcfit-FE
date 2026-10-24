const config = require("./app.json").expo;

module.exports = () => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || config.extra?.eas?.projectId;
  return { ...config, ...(projectId ? { extra: { ...config.extra, eas: { projectId } } } : {}) };
};
