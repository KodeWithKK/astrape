import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/user.schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ email: user.email });
}
