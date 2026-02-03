const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const adminMockPath = path.resolve(projectRoot, 'admin-panel', 'mock');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [...(config.watchFolders || []), adminMockPath];

module.exports = config;
