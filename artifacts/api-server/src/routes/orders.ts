import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cartItemsTable, peppersTable, ordersTable } from "@workspace/db";
import {
  PlaceOrderBody,
  GetOrderParams,
  ListOrdersResponse,
  GetOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatOrder(order: typeof ordersTable.$inferSelect) {
  return {
    ...order,
    total: parseFloat(order.total),
    items: order.items as Array<{
      pepperId: number;
      pepperName: string;
      quantity: number;
      priceAtOrder: number;
      subtotal: number;
    }>,
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  res.json(ListOrdersResponse.parse(orders.map(formatOrder)));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = PlaceOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { customerName, customerEmail, customerAddress } = parsed.data;

  const cartItems = await db
    .select()
    .from(cartItemsTable)
    .orderBy(cartItemsTable.createdAt);

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const orderItems = [];
  let total = 0;

  for (const item of cartItems) {
    const [pepper] = await db.select().from(peppersTable).where(eq(peppersTable.id, item.pepperId));
    if (!pepper) continue;

    const price = parseFloat(pepper.price);
    const subtotal = price * item.quantity;
    total += subtotal;

    orderItems.push({
      pepperId: item.pepperId,
      pepperName: pepper.name,
      quantity: item.quantity,
      priceAtOrder: price,
      subtotal,
    });
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName,
      customerEmail,
      customerAddress,
      items: orderItems,
      total: total.toFixed(2),
      status: "confirmed",
    })
    .returning();

  await db.delete(cartItemsTable);

  res.status(201).json(GetOrderResponse.parse(formatOrder(order)));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(formatOrder(order)));
});

export default router;
