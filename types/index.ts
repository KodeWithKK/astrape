export interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  baseColour: string;
  brand: {
    name: string;
  };
}

export interface FilterOptions {
  brands: string[];
  categories: string[];
  genders: string[];
}
