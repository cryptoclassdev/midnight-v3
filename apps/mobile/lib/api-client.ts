import ky from "ky";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. Define it in apps/mobile/.env (dev) or the EAS build profile (prod).",
  );
}

if (__DEV__) console.log("[api-client] API_BASE_URL:", API_BASE_URL);

// Retry only GETs that are safe to replay. The API now serves stale data on
// Jupiter 5xx failures, so retrying 500/502 just amplifies upstream load.
// 408 (timeout) and 429 (rate limited) are the only statuses where a retry is
// likely to succeed without compounding the problem.
export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 15_000,
  retry: {
    limit: 1,
    methods: ["get"],
    statusCodes: [408, 429],
    backoffLimit: 1500,
  },
  hooks: {
    beforeRequest: __DEV__
      ? [
          (request) => {
            console.log("[api-client] >>", request.method, request.url);
          },
        ]
      : [],
    afterResponse: __DEV__
      ? [
          (_request, _options, response) => {
            console.log("[api-client] <<", response.status, response.url);
          },
        ]
      : [],
    beforeError: [
      (error) => {
        if (__DEV__) console.warn("[api-client] ERROR:", error.message, error.response?.status, error.request?.url);
        return error;
      },
    ],
  },
});
