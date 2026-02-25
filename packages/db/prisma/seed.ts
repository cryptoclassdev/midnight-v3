import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

const FEED_SOURCES = [
  {
    url: "https://cointelegraph.com/rss",
    name: "CoinTelegraph RSS",
    category: Category.CRYPTO,
  },
  {
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    name: "CoinDesk RSS",
    category: Category.CRYPTO,
  },
  {
    url: "https://decrypt.co/feed",
    name: "Decrypt RSS",
    category: Category.CRYPTO,
  },
  {
    url: "https://thedefiant.io/feed",
    name: "The Defiant RSS",
    category: Category.CRYPTO,
  },
  {
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    name: "TechCrunch AI",
    category: Category.AI,
  },
  {
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    name: "The Verge AI",
    category: Category.AI,
  },
  {
    url: "https://venturebeat.com/category/ai/feed/",
    name: "VentureBeat AI",
    category: Category.AI,
  },
];

async function main() {
  console.log("Seeding feed sources...");

  for (const source of FEED_SOURCES) {
    await prisma.feedSource.upsert({
      where: { url: source.url },
      update: { name: source.name, category: source.category },
      create: source,
    });
    console.log(`  Upserted: ${source.name}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
