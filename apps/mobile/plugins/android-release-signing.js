const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * The Expo template already includes a release signingConfig that reads
 * ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, and ANDROID_KEY_PASSWORD
 * from env. This plugin wraps those System.getenv() calls in .trim() so
 * stray trailing whitespace or newlines in GitHub Secrets cannot corrupt
 * the password bytes passed to the Java keystore decrypter.
 *
 * Also sets storeType 'PKCS12' explicitly to match the keystore format.
 */
function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;

    gradle = gradle.replace(
      /storePassword System\.getenv\('ANDROID_KEYSTORE_PASSWORD'\)\s*\?:\s*''/,
      "storePassword (System.getenv('ANDROID_KEYSTORE_PASSWORD') ?: '').trim()",
    );
    gradle = gradle.replace(
      /keyAlias System\.getenv\('ANDROID_KEY_ALIAS'\)\s*\?:\s*''/,
      "keyAlias (System.getenv('ANDROID_KEY_ALIAS') ?: '').trim()",
    );
    gradle = gradle.replace(
      /keyPassword System\.getenv\('ANDROID_KEY_PASSWORD'\)\s*\?:\s*''/,
      "keyPassword (System.getenv('ANDROID_KEY_PASSWORD') ?: '').trim()",
    );

    if (!gradle.includes("storeType 'PKCS12'")) {
      gradle = gradle.replace(
        /(keyPassword \(System\.getenv\('ANDROID_KEY_PASSWORD'\)[^\n]+\n)/,
        "$1            storeType 'PKCS12'\n",
      );
    }

    cfg.modResults.contents = gradle;
    return cfg;
  });
}

module.exports = withAndroidReleaseSigning;
