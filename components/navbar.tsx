"use client";

import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UserData {
  email: string;
}

const Navbar = () => {
  const cart = useCartStore((state) => state.cart);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery<UserData, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user", { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }
      return res.json();
    },
    retry: false,
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setIsPopoverOpen(false);
    queryClient.removeQueries({ queryKey: ["user"] });
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          Astrape
        </Link>
        <div className="flex items-center space-x-6">
          {isLoading ? (
            <div className="w-6 h-6 rounded-full bg-gray-700 animate-pulse"></div>
          ) : userData ? (
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className="hover:text-gray-300 transition-colors focus:outline-none"
              >
                <User size={24} />
              </button>
              {isPopoverOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <div className="block px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                    {userData.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hover:text-gray-300 transition-colors"
            >
              <User size={24} />
            </Link>
          )}
          <Link
            href="/cart"
            className="relative hover:text-gray-300 transition-colors"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
