/** Mirrors .specs/02-modelo-de-dados.md and the backend Prisma schema. */

export interface MenuItemCustomization {
  removableIngredients?: string[];
  extraIngredients?: { name: string; price: number }[];
  /** Whether the item supports meat point selection (rare/medium/well done). */
  meatPoint?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  /** Price in cents (BRL centavos). */
  price: number;
  category: string;
  customization?: MenuItemCustomization | null;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}
