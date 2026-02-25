import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { feedRoutes } from "./routes/feed";
import { marketRoutes } from "./routes/market";
import { healthRoutes } from "./routes/health";
import { startCronJobs } from "./cron";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.route("/api/v1", feedRoutes);
app.route("/api/v1", marketRoutes);
app.route("/api/v1", healthRoutes);

const PORT = Number(process.env.PORT) || 3000;

console.log(`Starting MintFeed API on port ${PORT}`);

startCronJobs();

serve({
  fetch: app.fetch,
  port: PORT,
});
