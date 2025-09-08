"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/use-cart-store";

interface SignupRequest {
  email: string;
  password: string;
}

interface SignupResponse {
  message: string;
}

async function signupUser(credentials: SignupRequest): Promise<SignupResponse> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    throw new Error("Signup failed");
  }
  return res.json();
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);

  const { mutate, isPending, isError, error } = useMutation<
    SignupResponse,
    Error,
    SignupRequest
  >({
    mutationFn: signupUser,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });

      if (cart.length > 0) {
        await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cart),
        });
      }

      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.ok) {
        const dbCart = await res.json();

        setCart(dbCart);
      }

      router.push("/");
    },
    onError: (err) => {
      console.error("Signup error:", err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">
          Create an Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isPending}
          >
            {isPending ? "Signing up..." : "Sign up"}
          </button>
          {isError && (
            <p className="text-red-500 text-center">
              {error?.message || "An error occurred"}
            </p>
          )}
        </form>
        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
