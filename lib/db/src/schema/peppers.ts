import { pgTable, text, serial, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const peppersTable = pgTable("peppers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  heatLevel: integer("heat_level").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").notNull().default(true),
  stockCount: integer("stock_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  origin: text("origin").notNull(),
  flavorProfile: text("flavor_profile").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPepperSchema = createInsertSchema(peppersTable).omit({ id: true, createdAt: true });
export type InsertPepper = z.infer<typeof insertPepperSchema>;
export type Pepper = typeof peppersTable.$inferSelect;
