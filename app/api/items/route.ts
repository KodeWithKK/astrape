import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { InferSelectModel } from "drizzle-orm";
import { products, brands, sizes, media } from "@/db/product.schema";
import { type Product } from "@/types";

type ProductWithRelations = InferSelectModel<typeof products> & {
  brand: InferSelectModel<typeof brands> | null;
  sizes: InferSelectModel<typeof sizes>[];
  medias: InferSelectModel<typeof media>[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Fetch products with their related brands, analytics, sizes, and ratings
  const rawProducts = (await db.query.products.findMany({
    with: {
      brand: true,
      analytic: true,
      sizes: true,
      medias: true,
    },
  })) as ProductWithRelations[];

  const allItems = rawProducts.map((product: ProductWithRelations): Product => {
    // Calculate minimum price from sizes
    let minPrice = Infinity;

    product.sizes.forEach((size) => {
      const currentPrice =
        size.mrp - (size.mrp * (size.discountPercentage || 0)) / 100;
      if (currentPrice < minPrice) {
        minPrice = currentPrice;
      }
    });

    // Extract image URLs
    const images = product.medias.map((mediaItem) => mediaItem.url);

    return {
      id: product.id,
      name: product.name,
      price: minPrice === Infinity ? 0 : minPrice,
      images: images,
      baseColour: product.baseColour || "N/A",
      brand: {
        name: product.brand?.name || "N/A",
      },
    };
  });

  const brands = searchParams.get("brands")?.split(",");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  let filteredItems: Product[] = allItems;

  if (brands && brands.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      brands.includes(item.brand.name)
    );
  }

  if (minPrice) {
    filteredItems = filteredItems.filter(
      (item) => item.price >= parseInt(minPrice)
    );
  }

  if (maxPrice) {
    filteredItems = filteredItems.filter(
      (item) => item.price <= parseInt(maxPrice)
    );
  }

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedItems: Product[] = filteredItems.slice(startIndex, endIndex);

  return NextResponse.json({
    data: paginatedItems,
    total: filteredItems.length,
  });
}
