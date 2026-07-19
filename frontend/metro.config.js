// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * `expo-sqlite` ships a WebAssembly build for web (`wa-sqlite.wasm`). Metro
 * does not treat `.wasm` as an asset by default, so bundling for web fails to
 * resolve it — even though `src/db/schema.ts` only reaches for SQLite on
 * native, since Metro still resolves the `require('expo-sqlite')` statically.
 *
 * The wasm build needs `SharedArrayBuffer`, which browsers only expose to
 * cross-origin-isolated pages — hence the COOP/COEP headers on the dev server.
 */
config.resolver.assetExts.push('wasm');

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    return middleware(req, res, next);
  };
};

module.exports = config;
