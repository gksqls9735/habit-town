const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

// SQLite's web worker loads WASM and requires cross-origin isolation.
config.resolver.assetExts.push('wasm');
const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  try {
    const resolver = resolveRequest ?? context.resolveRequest;
    return resolver(context, moduleName, platform);
  } catch (error) {
    const originPath = context.originModulePath ?? '';
    const isCalendarRelativeImport =
      originPath.includes(`node_modules${path.sep}react-native-calendars${path.sep}`) &&
      moduleName.startsWith('.');

    if (isCalendarRelativeImport) {
      const indexPath = path.resolve(path.dirname(originPath), moduleName, 'index.js');

      if (fs.existsSync(indexPath)) {
        return {
          filePath: indexPath,
          type: 'sourceFile',
        };
      }
    }

    throw error;
  }
};
const enhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const handler = enhanceMiddleware ? enhanceMiddleware(middleware, server) : middleware;
  return (request, response, next) => {
    response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return handler(request, response, next);
  };
};

module.exports = config;
