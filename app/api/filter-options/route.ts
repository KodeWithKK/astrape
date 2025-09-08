import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { brands, analytics } from "@/db/product.schema";
import { FilterOptions } from "@/types";

export async function GET() {
  // Fetch unique brand names
  const uniqueBrands = await db
    .selectDistinct({ name: brands.name })
    .from(brands);
  const brandNames = uniqueBrands.map((b) => b.name);

  // Fetch unique article types (categories)
  const uniqueCategories = await db
    .selectDistinct({ articleType: analytics.articleType })
    .from(analytics);
  const categoryNames = uniqueCategories.map((a) => a.articleType);

  // Fetch unique genders
  const uniqueGenders = await db
    .selectDistinct({ gender: analytics.gender })
    .from(analytics);
  const genderNames = uniqueGenders.map((a) => a.gender);

  const filterOptions: FilterOptions = {
    brands: brandNames,
    categories: categoryNames,
    genders: genderNames,
  };

  return NextResponse.json(filterOptions);
}
