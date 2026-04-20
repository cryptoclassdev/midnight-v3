/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@solana-mobile/.*|@solana/.*|@wallet-ui/.*|@wallet-standard/.*|@tanstack/.*|zustand|ky|bs58|js-base64|@midnight/.*)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@midnight/shared$": "<rootDir>/../../packages/shared/src",
  },
  setupFilesAfterEnv: ["./jest.setup.ts"],
};
