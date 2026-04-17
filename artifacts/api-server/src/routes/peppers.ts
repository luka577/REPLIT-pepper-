import { Router, type IRouter } from "express";
import { eq, like, gte, lte, and, desc, asc, sql } from "drizzle-orm";
import { db, peppersTable } from "@workspace/db";
import {
  ListPeppersQueryParams,
  GetPepperParams,
  GetPepperResponse,
  ListPeppersResponse,
  GetFeaturedPeppersResponse,
  GetPepperCategoriesResponse,
  GetPepperStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/peppers", async (req, res): Promise<void> => {
  const parsed = ListPeppersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, minHeat, maxHeat, search } = parsed.data;

  const conditions = [];
  if (category) conditions.push(eq(peppersTable.category, category));
  if (minHeat != null) conditions.push(gte(peppersTable.heatLevel, minHeat));
  if (maxHeat != null) conditions.push(lte(peppersTable.heatLevel, maxHeat));
  if (search) conditions.push(like(peppersTable.name, `%${search}%`));

  const peppers = await db
    .select()
    .from(peppersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(peppersTable.name));

  res.json(ListPeppersResponse.parse(peppers.map(formatPepper)));
});

router.get("/peppers/featured", async (_req, res): Promise<void> => {
  const peppers = await db
    .select()
    .from(peppersTable)
    .where(eq(peppersTable.isFeatured, true))
    .orderBy(desc(peppersTable.heatLevel));

  res.json(GetFeaturedPeppersResponse.parse(peppers.map(formatPepper)));
});

router.get("/peppers/categories", async (_req, res): Promise<void> => {
  const peppers = await db.select().from(peppersTable);

  const categoryMap = new Map<string, { count: number; minHeat: number; maxHeat: number }>();
  for (const p of peppers) {
    const existing = categoryMap.get(p.category);
    if (existing) {
      existing.count += 1;
      existing.minHeat = Math.min(existing.minHeat, p.heatLevel);
      existing.maxHeat = Math.max(existing.maxHeat, p.heatLevel);
    } else {
      categoryMap.set(p.category, { count: 1, minHeat: p.heatLevel, maxHeat: p.heatLevel });
    }
  }

  const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    ...data,
  }));

  res.json(GetPepperCategoriesResponse.parse(categories));
});

router.get("/peppers/stats", async (_req, res): Promise<void> => {
  const peppers = await db.select().from(peppersTable);

  if (peppers.length === 0) {
    res.json(GetPepperStatsResponse.parse({
      totalPeppers: 0,
      avgHeatLevel: 0,
      totalInStock: 0,
      hottestPepper: null,
      mildestPepper: null,
    }));
    return;
  }

  const totalPeppers = peppers.length;
  const avgHeatLevel = Math.round(peppers.reduce((acc, p) => acc + p.heatLevel, 0) / totalPeppers);
  const totalInStock = peppers.filter(p => p.inStock).length;
  const sorted = [...peppers].sort((a, b) => b.heatLevel - a.heatLevel);
  const hottestPepper = sorted[0] ? formatPepper(sorted[0]) : null;
  const mildestPepper = sorted[sorted.length - 1] ? formatPepper(sorted[sorted.length - 1]) : null;

  res.json(GetPepperStatsResponse.parse({
    totalPeppers,
    avgHeatLevel,
    totalInStock,
    hottestPepper,
    mildestPepper,
  }));
});

router.get("/peppers/:id", async (req, res): Promise<void> => {
  const params = GetPepperParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pepper] = await db
    .select()
    .from(peppersTable)
    .where(eq(peppersTable.id, params.data.id));

  if (!pepper) {
    res.status(404).json({ error: "Pepper not found" });
    return;
  }

  res.json(GetPepperResponse.parse(formatPepper(pepper)));
});

function formatPepper(p: typeof peppersTable.$inferSelect) {
  return {
    ...p,
    price: parseFloat(p.price),
    imageUrl: p.imageUrl ?? undefined,
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
