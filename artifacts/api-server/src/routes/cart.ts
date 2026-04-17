import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cartItemsTable, peppersTable } from "@workspace/db";
import {
  AddToCartBody,
  UpdateCartItemBody,
  UpdateCartItemParams,
  RemoveFromCartParams,
  GetCartResponse,
  AddToCartResponse,
  UpdateCartItemResponse,
  RemoveFromCartResponse,
  ClearCartResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getCartWithPeppers() {
  const items = await db
    .select()
    .from(cartItemsTable)
    .orderBy(cartItemsTable.createdAt);

  const result = [];
  for (const item of items) {
    const [pepper] = await db
      .select()
      .from(peppersTable)
      .where(eq(peppersTable.id, item.pepperId));

    if (!pepper) continue;

    const pepperFormatted = {
      ...pepper,
      price: parseFloat(pepper.price),
      imageUrl: pepper.imageUrl ?? undefined,
      createdAt: pepper.createdAt.toISOString(),
    };

    result.push({
      id: item.id,
      pepperId: item.pepperId,
      pepper: pepperFormatted,
      quantity: item.quantity,
      subtotal: parseFloat(pepper.price) * item.quantity,
    });
  }
  return result;
}

router.get("/cart", async (_req, res): Promise<void> => {
  const cart = await getCartWithPeppers();
  res.json(GetCartResponse.parse(cart));
});

router.post("/cart", async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { pepperId, quantity } = parsed.data;

  const [pepper] = await db.select().from(peppersTable).where(eq(peppersTable.id, pepperId));
  if (!pepper) {
    res.status(404).json({ error: "Pepper not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.pepperId, pepperId));

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.pepperId, pepperId));
  } else {
    await db.insert(cartItemsTable).values({ pepperId, quantity });
  }

  const cart = await getCartWithPeppers();
  res.json(AddToCartResponse.parse(cart));
});

router.put("/cart/:pepperId", async (req, res): Promise<void> => {
  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { quantity } = parsed.data;

  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.pepperId, params.data.pepperId));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(eq(cartItemsTable.pepperId, params.data.pepperId));
  }

  const cart = await getCartWithPeppers();
  res.json(UpdateCartItemResponse.parse(cart));
});

router.delete("/cart/clear", async (_req, res): Promise<void> => {
  await db.delete(cartItemsTable);
  res.json(ClearCartResponse.parse([]));
});

router.delete("/cart/:pepperId", async (req, res): Promise<void> => {
  const params = RemoveFromCartParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.pepperId, params.data.pepperId));

  const cart = await getCartWithPeppers();
  res.json(RemoveFromCartResponse.parse(cart));
});

export default router;
