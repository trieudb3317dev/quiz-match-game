/*
  app.config.js — Loads .env.local (if present) and injects values into expo.extra
  Usage:
    1. Install dotenv in your project: npm install dotenv --save-dev
    2. Start Expo (it will load this config): expo start -c

  This allows you to keep .env.local with NEXT_PUBLIC_* variables and have
  them available at runtime via Constants.expoConfig.extra in your app.
*/

const fs = require("fs");
const path = require("path");

// Load .env.local if it exists
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
} catch (e) {
  // ignore if dotenv isn't installed — we'll still fallback to app.json extras
}

// Read app.json so we can merge/override its "expo.extra" with env values
const appJson = require("./app.json");

const envExtra = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX,
  NEXT_PUBLIC_WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL,
  NEXT_PUBLIC_WS_PREFIX: process.env.NEXT_PUBLIC_WS_PREFIX,
};

module.exports = () => {
  return {
    ...appJson,
    expo: {
      ...appJson.expo,
      extra: {
        ...(appJson.expo && appJson.expo.extra ? appJson.expo.extra : {}),
        // override with any environment values (if set)
        ...Object.fromEntries(
          Object.entries(envExtra).filter(
            ([_, v]) => v !== undefined && v !== null,
          ),
        ),
      },
    },
  };
};
