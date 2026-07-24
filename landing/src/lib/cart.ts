import { productsApi, type Product } from "@/lib/api/productsApi";

const CART_KEY = "kwoka_cart";

export type CartLine = { productId: string; qty: number };

export function getCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as CartLine[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function setCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

export function addToCart(productId: string, qty = 1) {
  const cart = getCart();
  const existing = cart.find((l) => l.productId === productId);
  if (existing) existing.qty += qty;
  else cart.push({ productId, qty });
  setCart(cart);
}

export function removeFromCart(productId: string) {
  setCart(getCart().filter((l) => l.productId !== productId));
}

export function updateQty(productId: string, qty: number) {
  if (qty < 1) {
    removeFromCart(productId);
    return;
  }
  const cart = getCart().map((l) => (l.productId === productId ? { ...l, qty } : l));
  setCart(cart);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function cartLinesWithProducts(): { line: CartLine; product: Product }[] {
  return getCart()
    .map((line) => {
      const product = productsApi.getProduct(line.productId);
      return product ? { line, product } : null;
    })
    .filter(Boolean) as { line: CartLine; product: Product }[];
}

export function cartTotalCents(): number {
  return cartLinesWithProducts().reduce((sum, { line, product }) => sum + product.price * line.qty, 0);
}
