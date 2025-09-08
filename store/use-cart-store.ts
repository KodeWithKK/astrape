import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  productId: number;
  sizeId: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
  size: string;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: {
    productId: number;
    sizeId: number;
    name: string;
    price: number;
    image: string;
    size: string;
  }) => void;
  removeFromCart: (productId: number, sizeId: number) => void;
  increaseQuantity: (productId: number, sizeId: number) => void;
  decreaseQuantity: (productId: number, sizeId: number) => void;
  setCart: (newCart: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.sizeId === item.sizeId
          );

          let updatedCart;
          let newQuantity = 1;

          if (existingItem) {
            newQuantity = existingItem.quantity + 1;
            updatedCart = state.cart.map((cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.sizeId === item.sizeId
                ? { ...cartItem, quantity: newQuantity }
                : cartItem
            );
          } else {
            updatedCart = [...state.cart, { ...item, quantity: newQuantity }];
          }

          // Check if user is logged in before persisting to DB
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
          if (token) {
            fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: item.productId,
                sizeId: item.sizeId,
                quantity: newQuantity,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  console.error(
                    "Failed to persist cart item to DB:",
                    response.status,
                    response.statusText
                  );
                }
              })
              .catch((error) =>
                console.error("Error persisting cart item to DB:", error)
              );
          }

          return { cart: updatedCart };
        }),

      removeFromCart: (productId, sizeId) =>
        set((state) => {
          const updatedCart = state.cart.filter(
            (item) => !(item.productId === productId && item.sizeId === sizeId)
          );

          // Check if user is logged in before persisting to DB
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
          if (token) {
            fetch("/api/cart/remove-item", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId, sizeId }),
            })
              .then((response) => {
                if (!response.ok) {
                  console.error(
                    "Failed to remove cart item from DB:",
                    response.status,
                    response.statusText
                  );
                }
              })
              .catch((error) =>
                console.error("Error removing cart item from DB:", error)
              );
          }

          return { cart: updatedCart };
        }),

      increaseQuantity: (productId, sizeId) =>
        set((state) => {
          let newQuantity = 0;
          const updatedCart = state.cart.map((cartItem) => {
            if (
              cartItem.productId === productId &&
              cartItem.sizeId === sizeId
            ) {
              newQuantity = cartItem.quantity + 1;
              return { ...cartItem, quantity: newQuantity };
            }
            return cartItem;
          });

          // Check if user is logged in before persisting to DB
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
          if (token) {
            fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId,
                sizeId,
                quantity: newQuantity,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  console.error(
                    "Failed to increase cart item quantity in DB:",
                    response.status,
                    response.statusText
                  );
                }
              })
              .catch((error) =>
                console.error(
                  "Error increasing cart item quantity in DB:",
                  error
                )
              );
          }

          return { cart: updatedCart };
        }),

      decreaseQuantity: (productId, sizeId) =>
        set((state) => {
          let newQuantity = 0;
          const updatedCart = state.cart.map((cartItem) => {
            if (
              cartItem.productId === productId &&
              cartItem.sizeId === sizeId &&
              cartItem.quantity > 1
            ) {
              newQuantity = cartItem.quantity - 1;
              return { ...cartItem, quantity: newQuantity };
            }
            return cartItem;
          });

          // Check if user is logged in before persisting to DB
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
          if (token && newQuantity > 0) {
            fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId,
                sizeId,
                quantity: newQuantity,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  console.error(
                    "Failed to decrease cart item quantity in DB:",
                    response.status,
                    response.statusText
                  );
                }
              })
              .catch((error) =>
                console.error(
                  "Error decreasing cart item quantity in DB:",
                  error
                )
              );
          }

          return { cart: updatedCart };
        }),

      setCart: (newCart: CartItem[]) => set({ cart: newCart }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
