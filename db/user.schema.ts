import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { products, sizes } from "./product.schema";

/* ------- TABLES ------- */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    productId: integer("product_id").notNull(),
    sizeId: integer("size_id"), // Made nullable
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [users.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({ columns: [table.productId], foreignColumns: [products.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
    // Removed foreignKey constraint for sizeId temporarily
    uniqueIndex().on(table.userId, table.productId, table.sizeId),
  ]
);

/* ------- RELATIONS ------- */
export const userRelations = relations(users, ({ many }) => ({
  carts: many(carts),
}));

export const cartRelations = relations(carts, ({ one }) => ({
  users: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  products: one(products, {
    fields: [carts.productId],
    references: [products.id],
  }),
  sizes: one(sizes, {
    fields: [carts.sizeId],
    references: [sizes.id],
  }),
}));
