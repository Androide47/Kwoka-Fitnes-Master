export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  type: "physical" | "digital" | "session_package" | "subscription";
  sessionCredits?: number;
};

export const mockProducts: Product[] = [
  {
    id: "prog-strength",
    name: "12-Week Strength",
    price: 89,
    description: "Progressive overload program with video cues.",
    category: "Programs",
    type: "digital",
  },
  {
    id: "band-kit",
    name: "Resistance Band Kit",
    price: 34,
    description: "Five bands, door anchor, and carry bag.",
    category: "Gear",
    type: "physical",
  },
  {
    id: "nutrition-guide",
    name: "Fuel Guide PDF",
    price: 19,
    description: "Meal timing and macros for busy athletes.",
    category: "Digital",
    type: "digital",
  },
  {
    id: "recovery-bundle",
    name: "Recovery Bundle",
    price: 45,
    description: "Foam roller + mobility checklist.",
    category: "Gear",
    type: "physical",
  },
  {
    id: "pkg-monthly-sessions",
    name: "Monthly Sessions (Test)",
    price: 99,
    description: "A monthly block of sessions for trying purchases and renewals in the demo store.",
    category: "Memberships",
    type: "session_package",
    sessionCredits: 8,
  },
  {
    id: "pkg-app-training",
    name: "App Training (Test)",
    price: 39,
    description: "Train on the Kwoka app with guided workouts, tracking, and coach messaging.",
    category: "Memberships",
    type: "subscription",
  },
  {
    id: "pkg-premium-subscription",
    name: "Premium + Kit (Test)",
    price: 149,
    description: "Premium subscription with app access plus a Kwoka shirt and water cup shipped to you.",
    category: "Memberships",
    type: "subscription",
    sessionCredits: 12,
  },
];
