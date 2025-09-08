import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { carts } from "@/db/user.schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientCartItems: Array<{
      productId: number;
      sizeId: number;
      quantity: number;
    }> = await req.json();

    // Fetch existing cart items for the user from the database
    const existingCartItems = await db.query.carts.findMany({
      where: eq(carts.userId, userId),
    });

    for (const clientItem of clientCartItems) {
      if (
        clientItem.productId === null ||
        clientItem.productId === undefined ||
        clientItem.sizeId === null ||
        clientItem.sizeId === undefined
      ) {
        return NextResponse.json(
          {
            message: "Invalid cart item: productId or sizeId is missing",
            receivedItems: clientCartItems,
          },
          { status: 400 }
        );
      }

      const existingItem = existingCartItems.find(
        (item) =>
          item.productId === clientItem.productId &&
          item.sizeId === clientItem.sizeId
      );

      if (existingItem) {
        // Update quantity if item already exists
        await db
          .update(carts)
          .set({ quantity: clientItem.quantity })
          .where(and(eq(carts.id, existingItem.id), eq(carts.userId, userId)));
      } else {
        // Insert new item if it doesn't exist
        await db.insert(carts).values({
          userId,
          productId: clientItem.productId,
          sizeId: clientItem.sizeId,
          quantity: clientItem.quantity,
        });
      }
    }

    return NextResponse.json({ message: "Cart synchronized successfully" });
  } catch (error) {
    console.error("Cart synchronization error:", error);
    return NextResponse.json(
      { message: "Cart synchronization failed" },
      { status: 500 }
    );
  }
}
