import { db } from "@/db/drizzle";
import {
  analytics,
  analyticsInsertSchema,
  brands,
  brandsInsertSchema,
  media,
  mediaInsertSchema,
  MediaType,
  products,
  productsInsertSchema,
  sizes,
  sizesInsertSchema,
} from "@/db/product.schema";
import { NextResponse } from "next/server";
import productsDataset from "@/dataset/products.json";

function findMrp(price: number, discountPercentage?: number) {
  const mrp = Math.trunc(price / ((100 - (discountPercentage || 0)) / 100));
  const unitDigit = mrp % 10;
  const adjustedMrp = mrp + (9 - unitDigit);
  return adjustedMrp;
}

export async function GET() {
  try {
    // Create Brands
    const uniqueBrands = Array.from(
      new Set(productsDataset.data.map((p) => p.brand.name))
    );

    const requiredBrandsDataset = uniqueBrands.map((b) => ({
      name: b,
      description: "A Good Brand",
    }));

    for (const brand of requiredBrandsDataset) {
      const { success } = brandsInsertSchema.safeParse(brand);

      if (!success) {
        return NextResponse.json(
          { error: "Invalid brand dateset" },
          { status: 500 }
        );
      }
    }

    const insertedBrands = await db
      .insert(brands)
      .values(requiredBrandsDataset)
      .returning();

    // Making the dataset structured
    const structuredDataset = productsDataset.data.map((p) => ({
      productData: {
        name: p.name,
        manufacturer: p.manufacturer,
        countryOfOrigin: p.countryOfOrigin,
        baseColour: p.baseColour,
        brandId: insertedBrands.find((brand) => brand.name === p.brand.name)
          ?.id as number,
        description: p.productDetails.description,
        materialAndCare: p.productDetails.materialAndCare,
        specifications: p.productDetails.specification,
      },
      productImages: p.images.map((url) => ({
        type: "image" as MediaType,
        url: url,
      })),
      productSizes: p.sizes.map((s) => ({
        label: s.label,
        available: s.available,
        mrp: s.price ? findMrp(s.price, p.discounts?.[0]?.percent) : 2999,
        discountPercentage: p.discounts?.[0]?.percent || 0,
        measurements: s.measurements,
      })),
      productAnalytics: {
        gender: p.analytics.gender.toLowerCase(),
        articleType: p.analytics.articleType,
        category: p.analytics.subCategory,
      },
    }));

    // Adding Products
    for (const {
      productData,
      productSizes,
      productImages,
      productAnalytics,
    } of structuredDataset) {
      const { data: parsedProduct, success: isProductParseSuccess } =
        productsInsertSchema.safeParse(productData);

      if (!isProductParseSuccess) {
        return NextResponse.json(
          { error: "Invalid brand dateset" },
          { status: 500 }
        );
      }

      const [insertedProduct] = await db
        .insert(products)
        .values(parsedProduct)
        .returning();

      // product sizes
      const updatedProductSizes = productSizes.map((s) => ({
        ...s,
        productId: insertedProduct.id,
      }));

      for (const s of updatedProductSizes) {
        const { success } = sizesInsertSchema.safeParse(s);

        if (!success) {
          return NextResponse.json(
            { error: "Invalid sizes dateset" },
            { status: 500 }
          );
        }
      }

      await db.insert(sizes).values(updatedProductSizes);

      // products medias
      const updatedProductImages = productImages.map((i) => ({
        ...i,
        productId: insertedProduct.id,
      }));

      for (const i of updatedProductImages) {
        const { success } = mediaInsertSchema.safeParse(i);

        if (!success) {
          return NextResponse.json(
            { error: "Invalid images dateset" },
            { status: 500 }
          );
        }
      }

      await db.insert(media).values(updatedProductImages);

      // products analytics
      const { data: updatedProductAnalytics, success: isAnalyticParseSuccess } =
        analyticsInsertSchema.safeParse({
          ...productAnalytics,
          productId: insertedProduct.id,
        });

      if (!isAnalyticParseSuccess) {
        return NextResponse.json(
          { error: "Invalid Product Analytic dataset" },
          { status: 500 }
        );
      }

      await db.insert(analytics).values(updatedProductAnalytics);
    }
    return NextResponse.json({ message: "Dataset loaded successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load dataset." },
      { status: 500 }
    );
  }
}
