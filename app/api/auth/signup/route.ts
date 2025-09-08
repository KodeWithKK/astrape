import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/user.schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const userExists = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (userExists) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        hashedPassword,
      })
      .returning({ id: users.id });

    if (!newUser) {
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 }
      );
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ userId: newUser.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    const response = NextResponse.json({ message: "Signup successful" });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Signup failed" }, { status: 500 });
  }
}
