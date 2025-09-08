"use client";

import { FilterOptions } from "@/types";
import { useState } from "react";
import { motion } from "framer-motion";
interface FilterState extends FilterOptions {
  priceRange: [number, number];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: FilterOptions;
  onApply: (filters: FilterState) => void;
}

export function FilterModal({
  isOpen,
  onClose,
  options,
  onApply,
}: FilterModalProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [genders, setGenders] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  const handleBrandChange = (brand: string) => {
    setBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleCategoryChange = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleGenderChange = (gender: string) => {
    setGenders((prev) =>
      prev.includes(gender)
        ? prev.filter((g) => g !== gender)
        : [...prev, gender]
    );
  };

  const handleApply = () => {
    onApply({ brands, categories, genders, priceRange });
    onClose();
  };

  const handleClear = () => {
    setBrands([]);
    setCategories([]);
    setGenders([]);
    setPriceRange([0, 5000]);
    onApply({
      brands: [],
      categories: [],
      genders: [],
      priceRange: [0, 5000],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 backdrop-blur-md bg-gray-950/90 bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-gray-800 text-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brands */}
          <div>
            <h3 className="font-semibold mb-2">Brand</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {options.brands.map((brand: string) => (
                <label
                  key={brand}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={brands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-2">Category</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {options.categories.map((category: string) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Genders */}
          <div>
            <h3 className="font-semibold mb-2">Gender</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {options.genders.map((gender: string) => (
                <label
                  key={gender}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={genders.includes(gender)}
                    onChange={() => handleGenderChange(gender)}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-2">Price Range</h3>
            <div className="flex items-center space-x-4">
              <span>₹{priceRange[0]}</span>
              <input
                type="range"
                min="0"
                max="5000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full"
              />
              <span>₹{priceRange[1]}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={handleClear}
            className="bg-gray-600 p-2 rounded-md hover:bg-gray-500"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApply}
            className="bg-blue-600 p-2 rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
