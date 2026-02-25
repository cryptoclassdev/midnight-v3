import { Hono } from "hono";
import { prisma, Category } from "@mintfeed/db";
import { DEFAULT_PAGE_SIZE } from "@mintfeed/shared";

export const feedRoutes = new Hono();

feedRoutes.get("/feed", async (c) => {
  const categoryParam = c.req.query("category") ?? "all";
  const cursor = c.req.query("cursor");
  const limit = Math.min(Number(c.req.query("limit")) || DEFAULT_PAGE_SIZE, 50);

  const where =
    categoryParam === "all"
      ? { imageUrl: { not: null } }
      : { category: categoryParam.toUpperCase() as Category, imageUrl: { not: null } };

  const articles = await prisma.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    select: {
      id: true,
      sourceUrl: true,
      sourceName: true,
      category: true,
      title: true,
      summary: true,
      originalTitle: true,
      imageUrl: true,
      imageBlurhash: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  const hasMore = articles.length > limit;
  const data = hasMore ? articles.slice(0, limit) : articles;
  const nextCursor = hasMore ? data[data.length - 1]?.id ?? null : null;

  return c.json({ data, nextCursor, hasMore });
});

feedRoutes.get("/feed/:id", async (c) => {
  const id = c.req.param("id");

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      sourceUrl: true,
      sourceName: true,
      category: true,
      title: true,
      summary: true,
      originalTitle: true,
      originalBody: true,
      imageUrl: true,
      imageBlurhash: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  if (!article) {
    return c.json({ error: "Article not found" }, 404);
  }

  return c.json(article);
});
