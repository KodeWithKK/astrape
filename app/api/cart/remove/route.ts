
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/drizzle';
import { carts } from '@/db/user.schema';

export async function POST(req: Request) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { productId, sizeId } = await req.json();

  if (!productId || !sizeId) {
    return NextResponse.json(
      { message: 'productId and sizeId are required' },
      { status: 400 }
    );
  }

  await db
    .delete(carts)
    .where(
      and(
        eq(carts.userId, userId),
        eq(carts.productId, productId),
        eq(carts.sizeId, sizeId)
      )
    );

  return NextResponse.json({ message: 'Item removed from cart' });
}
