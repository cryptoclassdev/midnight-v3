import cron from "node-cron";
import { processArticles } from "./services/article-processor.service";
import { fetchMarketData } from "./services/coingecko.service";

export function startCronJobs(): void {
  // Fetch articles every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    console.log("[Cron] Running article fetch...");
    await processArticles();
  });

  // Fetch market data every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("[Cron] Running market data fetch...");
    await fetchMarketData();
  });

  console.log("[Cron] Scheduled: articles (15min), market (5min)");

  // Run initial fetch on startup
  setTimeout(async () => {
    console.log("[Cron] Running initial data fetch...");
    await Promise.allSettled([processArticles(), fetchMarketData()]);
  }, 2_000);
}
