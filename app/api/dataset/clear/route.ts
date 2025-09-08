import { NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { analytics, brands, media, products, sizes } from "@/db/product.schema";

export async function GET() {
  try {
    await db.delete(analytics);
    await db.delete(media);
    await db.delete(sizes);
    await db.delete(products);
    await db.delete(brands);

    return NextResponse.json({ message: "Dataset cleared successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to clear dataset." },
      { status: 500 }
    );
  }
}
