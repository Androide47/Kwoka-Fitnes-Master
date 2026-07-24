import { mockProducts, type Product } from "@/data/mockProducts";

export const productsApi = {
  listProducts(): Product[] {
    return mockProducts;
  },

  getProduct(productId: string): Product | null {
    return mockProducts.find((product) => product.id === productId) ?? null;
  },
};

export function listProducts(): Product[] {
  return productsApi.listProducts();
}

export function getProduct(productId: string): Product | null {
  return productsApi.getProduct(productId);
}

export type { Product };
