export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
};

export const mockProducts: Product[] = [
  {
    id: "prog-strength",
    name: "12-Week Strength",
    price: 89,
    description: "Progressive overload program with video cues.",
    category: "Programs",
  },
  {
    id: "band-kit",
    name: "Resistance Band Kit",
    price: 34,
    description: "Five bands, door anchor, and carry bag.",
    category: "Gear",
  },
  {
    id: "nutrition-guide",
    name: "Fuel Guide PDF",
    price: 19,
    description: "Meal timing and macros for busy athletes.",
    category: "Digital",
  },
  {
    id: "recovery-bundle",
    name: "Recovery Bundle",
    price: 45,
    description: "Foam roller + mobility checklist.",
    category: "Gear",
  },
];
