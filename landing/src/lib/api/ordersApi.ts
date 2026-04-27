import { productsApi, type Product } from "@/lib/api/productsApi";
import { addSessionAllowance } from "@/lib/api/sessionCreditsApi";
import { readJson, writeJson } from "@/lib/api/storage";

const ORDERS_KEY = "kwoka_orders";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentProvider = "stripe" | "paypal";

export type OrderLine = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  productType: Product["type"];
};

export type Order = {
  id: string;
  customerEmail: string;
  customerName: string;
  shippingAddress?: string;
  paymentProvider: PaymentProvider;
  status: OrderStatus;
  lines: OrderLine[];
  total: number;
  sessionCreditsGranted: number;
  createdAt: string;
};

type CheckoutLine = {
  productId: string;
  qty: number;
};

export type CheckoutInput = {
  customerEmail: string;
  customerName: string;
  shippingAddress?: string;
  paymentProvider: PaymentProvider;
  lines: CheckoutLine[];
};

function readOrders(): Order[] {
  return readJson<Order[]>(ORDERS_KEY, []);
}

function writeOrders(orders: Order[]) {
  writeJson(ORDERS_KEY, orders);
}

export function listOrdersForCustomer(email: string): Order[] {
  const normalized = email.trim().toLowerCase();
  return readOrders()
    .filter((order) => order.customerEmail.toLowerCase() === normalized)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrder(id: string): Order | null {
  return readOrders().find((order) => order.id === id) ?? null;
}

export function createDemoCheckoutOrder(input: CheckoutInput): Order {
  const email = input.customerEmail.trim().toLowerCase();
  const name = input.customerName.trim();
  if (!email || !name) {
    throw new Error("Customer name and email are required.");
  }
  if (input.lines.length === 0) {
    throw new Error("Cart is empty.");
  }

  const products = productsApi.listProducts();
  const lines = input.lines.map((line) => {
    const product = products.find((p) => p.id === line.productId);
    if (!product) {
      throw new Error(`Unknown product: ${line.productId}`);
    }
    return {
      productId: product.id,
      name: product.name,
      qty: line.qty,
      unitPrice: product.price,
      productType: product.type,
    };
  });

  const sessionCreditsGranted = lines.reduce((sum, line) => {
    if (line.productType !== "session_package" && line.productType !== "subscription") return sum;
    const product = products.find((p) => p.id === line.productId);
    return sum + (product?.sessionCredits ?? 0) * line.qty;
  }, 0);

  const order: Order = {
    id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customerEmail: email,
    customerName: name,
    shippingAddress: input.shippingAddress?.trim() || undefined,
    paymentProvider: input.paymentProvider,
    status: "paid",
    lines,
    total: lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0),
    sessionCreditsGranted,
    createdAt: new Date().toISOString(),
  };

  writeOrders([order, ...readOrders()]);

  // The demo treats checkout as the payment webhook boundary. Production must grant
  // credits from provider webhooks only, never directly from the browser.
  if (sessionCreditsGranted > 0) {
    addSessionAllowance(email, sessionCreditsGranted);
  }

  return order;
}

export const ordersApi = {
  listForCustomer: listOrdersForCustomer,
  getOrder,
  createDemoCheckoutOrder,
};

