import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { products, media } from "@/db/product.schema";
import { carts } from "@/db/user.schema";

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userCart = await db.query.carts.findMany({
    where: eq(carts.userId, userId),
    with: {
      products: {
        columns: {
          id: true,
          name: true,
        },
        with: {
          sizes: {
            columns: {
              mrp: true,
            },
          },
          medias: {
            columns: {
              url: true,
            },
            where: eq(media.type, "image"),
            limit: 1,
          },
        },
      },
      sizes: {
        columns: {
          label: true,
        },
      },
    },
  });

  const formattedCart = userCart.map((cartItem) => ({
    productId: cartItem.products?.id || 0,
    name: cartItem.products?.name || "",
    price: cartItem.products?.sizes?.[0]?.mrp || 0,
    image: cartItem.products?.medias?.[0]?.url || "",
    sizeId: cartItem.sizeId || 0,
    size: cartItem.sizes?.label || "",
    quantity: cartItem.quantity,
  }));

  return NextResponse.json(formattedCart);
}

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { productId, sizeId, quantity } = await req.json();

  if (!productId || !sizeId || !quantity) {
    return NextResponse.json(
      { message: "productId, sizeId and quantity are required" },
      { status: 400 }
    );
  }

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const cartItem = await db.query.carts.findFirst({
      where: and(
        eq(carts.userId, userId),
        eq(carts.productId, productId),
        eq(carts.sizeId, sizeId)
      ),
    });

    if (cartItem) {
      await db
        .update(carts)
        .set({ quantity: quantity })
        .where(eq(carts.id, cartItem.id));
    } else {
      await db.insert(carts).values({
        userId,
        productId,
        sizeId,
        quantity,
      });
    }

    return NextResponse.json({ message: "Item added to cart" });
  } catch {
    return NextResponse.json(
      { message: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
