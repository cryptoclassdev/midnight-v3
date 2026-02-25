import ky from "ky";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3005";

console.log("[api-client] API_BASE_URL:", API_BASE_URL);

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 15_000,
  retry: { limit: 2 },
  hooks: {
    beforeRequest: [
      (request) => {
        console.log("[api-client] >>", request.method, request.url);
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        console.log("[api-client] <<", response.status, response.url);
      },
    ],
    beforeError: [
      (error) => {
        console.error("[api-client] ERROR:", error.message, error.response?.status, error.request?.url);
        return error;
      },
    ],
  },
});
