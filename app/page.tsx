"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/use-cart-store";
import { RingLoader } from "react-spinners";
import Link from "next/link";
import {
  useInfiniteQuery,
  InfiniteData,
  useQuery,
} from "@tanstack/react-query";
import { FilterOptions, Product } from "@/types";
import { FilterModal } from "@/components/filter-modal";

interface ItemsApiResponse {
  data: Product[];
  total: number;
}

interface FilterState extends FilterOptions {
  priceRange: [number, number];
}

async function fetchItems({
  pageParam = 1,
  queryKey,
}: {
  pageParam?: number;
  queryKey: [string, FilterState];
}): Promise<ItemsApiResponse> {
  const filters = queryKey[1];
  const params = new URLSearchParams();
  params.append("page", pageParam.toString());
  params.append("limit", "20");
  if (filters.brands.length > 0)
    params.append("brands", filters.brands.join(","));
  if (filters.categories.length > 0)
    params.append("categories", filters.categories.join(","));
  if (filters.genders.length > 0)
    params.append("genders", filters.genders.join(","));
  params.append("minPrice", filters.priceRange[0].toString());
  params.append("maxPrice", filters.priceRange[1].toString());

  const res = await fetch(`/api/items?${params.toString()}`);
  const data = await res.json();
  return data;
}

async function fetchFilterOptions(): Promise<FilterOptions> {
  const res = await fetch(`/api/filter-options`);
  const data = await res.json();
  return data;
}

export default function Home() {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    categories: [],
    genders: [],
    priceRange: [0, 5000],
  });

  const { data: filterOptionsData } = useQuery<FilterOptions, Error>({
    queryKey: ["filterOptions"],
    queryFn: fetchFilterOptions,
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions>(
    filterOptionsData || {
      brands: [],
      categories: [],
      genders: [],
    }
  );

  useEffect(() => {
    if (filterOptionsData) {
      setFilterOptions(filterOptionsData);
    }
  }, [filterOptionsData]);

  const { cart, addToCart } = useCartStore();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<
    ItemsApiResponse,
    Error,
    InfiniteData<ItemsApiResponse>,
    [string, FilterState],
    number
  >({
    queryKey: ["items", filters],
    queryFn: fetchItems,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data.length > 0 ? pages.length + 1 : undefined;
    },
  });

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const isItemInCart = (productId: number) => {
    return cart.some((cartItem) => cartItem.productId === productId);
  };

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  return (
    <div className="container mx-auto p-4 ">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold">All Products</h2>
        <button
          onClick={() => setFilterOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors duration-300"
        >
          Filters
        </button>
      </div>

      <AnimatePresence>
        <FilterModal
          isOpen={isFilterOpen}
          onClose={() => setFilterOpen(false)}
          options={filterOptions}
          onApply={handleApplyFilters}
        />
      </AnimatePresence>

      {isFetching && !isFetchingNextPage ? (
        <div className="flex justify-center items-center h-96">
          <RingLoader color="#3b82f6" size={80} />
        </div>
      ) : status === "error" ? (
        <div>Error: {error.message}</div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {items.map((item: Product) => (
              <motion.div
                layout
                key={item.id}
                className="border border-gray-700 p-4 rounded-lg shadow-lg bg-gray-800 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">
                    {item.name}
                  </h2>
                  <p className="text-gray-400 mb-2">{item.brand.name}</p>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-lg font-semibold text-blue-400">
                      ₹{Math.trunc(item.price)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 w-full">
                  {isItemInCart(item.id) ? (
                    <Link href="/cart">
                      <button className="bg-gray-600 text-white p-2 rounded-md w-full hover:bg-gray-700 transition-colors duration-300">
                        View in Cart
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={() =>
                        addToCart({
                          productId: item.id,
                          sizeId: 1,
                          name: item.name,
                          price: item.price,
                          image: item.images[0],
                          size: "One Size",
                        })
                      }
                      className="bg-blue-600 text-white p-2 rounded-md w-full hover:bg-blue-700 transition-colors duration-300"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-500"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
