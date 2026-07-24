export type UserRole = "client" | "trainer" | "admin";

export type AuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  token: string;
  issuedAt: number;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  startISO: string;
  endISO: string;
  clientEmail: string;
  trainerEmail: string;
  status: BookingStatus;
  title: string;
};

export type MonthCredits = { allowance: number };

export type ProductType = "physical" | "digital" | "session_package" | "subscription";

export type StoreProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  type: ProductType;
  sessionCredits?: number;
};

export type OrderStatus = "demo_paid" | "cancelled" | "refunded";

export type OrderLine = {
  productId: string;
  name: string;
  productType: ProductType;
  qty: number;
  unitPrice: number;
  sessionCreditsGranted?: number;
};

export type Order = {
  id: string;
  email: string;
  name: string;
  address?: string;
  paymentMethod: "stripe" | "paypal";
  status: OrderStatus;
  createdAt: string;
  total: number;
  lines: OrderLine[];
};

export type TrainerClient = {
  id: string;
  name: string;
  email: string;
  goal: string;
  lastSession: string;
  sessionsCompleted: number;
  progressSummary: string;
};

export type ContactSubmission = {
  id: string;
  type: "contact";
  name?: string;
  email: string;
  message: string;
  createdAt: string;
};

export type IssueSubmission = {
  id: string;
  type: "issue";
  email: string;
  category: string;
  details: string;
  createdAt: string;
};

export type NewsletterSubscription = {
  id: string;
  email: string;
  createdAt: string;
};
