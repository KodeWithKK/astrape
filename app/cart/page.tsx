"use client";

import { useCartStore } from "@/store/use-cart-store";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Cart() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCartStore();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cart.map((item) => (
              <motion.div
                layout
                key={item.productId}
                className="border border-gray-700 p-4 rounded-lg mb-4 flex flex-col md:flex-row items-center justify-between bg-gray-800 shadow-lg"
              >
                <div className="flex items-center mb-4 md:mb-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover aspect-square rounded-md mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{item.name}</h2>
                    <p className="text-gray-400">{item.size}</p>{" "}
                    <p className="text-lg font-semibold text-blue-400">
                      ₹{Math.trunc(item.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        decreaseQuantity(item.productId, item.sizeId)
                      }
                      disabled={item.quantity === 1}
                      className="bg-gray-700 p-2 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        increaseQuantity(item.productId, item.sizeId)
                      }
                      className="bg-gray-700 p-2 rounded-md hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId, item.sizeId)}
                    className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <p>Subtotal</p>
              <p>₹{total.toFixed(2)}</p>
            </div>
            <div className="flex justify-between mb-4">
              <p>Shipping</p>
              <p>Free</p>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between font-bold text-xl">
                <p>Total</p>
                <p>₹{total.toFixed(2)}</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white p-3 rounded-md mt-6 w-full hover:bg-blue-700 transition-colors">
              Checkout
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-2xl mb-4">Your cart is empty.</p>
          <Link href="/" className="text-blue-400 hover:underline">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
