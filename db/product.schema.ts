import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

/* ------- ENUMS -------   */
const mediaType = pgEnum("media_type", ["image", "video", "animated_gif"]);
const genderType = pgEnum("gender", ["men", "women", "unisex"]);

/* ------- TABLES ------- */
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    manufacturer: text("manufacturer"),
    countryOfOrigin: text("country_of_origin"),
    baseColour: text("base_colour"),
    brandId: integer("brand_id").notNull(),
    description: text("description"),
    materialAndCare: text("material_and_care"),
    specifications: jsonb("specifications"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({ columns: [table.brandId], foreignColumns: [brands.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({ columns: [table.brandId], foreignColumns: [brands.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
);

export const colours = pgTable(
  "colours",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    label: text("label").notNull(),
    url: text("url"),
    image: text("image"),
  },
  (table) => [
    foreignKey({ columns: [table.productId], foreignColumns: [products.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
);

export const sizes = pgTable(
  "sizes",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    label: text("label").notNull(),
    available: boolean("available").notNull(),
    mrp: integer("mrp").notNull(),
    discountPercentage: integer("discount_percentage").default(0).notNull(),
    measurements: jsonb("measurements"),
  },
  (table) => [
    foreignKey({ columns: [table.productId], foreignColumns: [products.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
);

export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    type: mediaType().default("image").notNull(),
    url: text("image_url").notNull(),
  },
  (table) => [
    foreignKey({ columns: [table.productId], foreignColumns: [products.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
);

export const ratings = pgTable(
  "ratings",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    userId: integer("user_id").notNull(),
    rating: integer("rating").notNull(),
    review: text("review"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({ columns: [table.productId], foreignColumns: [products.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
);

export const offers = pgTable(
  "offers",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    title: text("title"),
    description: text("description"),
  },
  (table) => [
    foreignKey({ columns: [table.productId], foreignColumns: [products.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
);

export const analytics = pgTable(
  "analytics",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    articleType: text("article_type").notNull(),
    gender: genderType().notNull(),
    category: text("category").notNull(),
  },
  (table) => [
    foreignKey({ columns: [table.productId], foreignColumns: [products.id] })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
);

/* ------- RELATIONS ------- */
export const productsRelations = relations(products, ({ one, many }) => ({
  sizes: many(sizes),
  medias: many(media),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  analytic: one(analytics),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const sizesRelations = relations(sizes, ({ one }) => ({
  product: one(products, {
    fields: [sizes.productId],
    references: [products.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  product: one(products, {
    fields: [media.productId],
    references: [products.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  product: one(products, {
    fields: [analytics.productId],
    references: [products.id],
  }),
}));

/* ------- INSERT SCHEMAS ------- */
export const brandsInsertSchema = createInsertSchema(brands);
export const productsInsertSchema = createInsertSchema(products);
export const sizesInsertSchema = createInsertSchema(sizes);
export const mediaInsertSchema = createInsertSchema(media);
export const analyticsInsertSchema = createInsertSchema(analytics);

/* ------- TYPES ------- */
export type MediaType = "image" | "video" | "animated_gif";
export type GenderType = "men" | "women" | "unisex";
