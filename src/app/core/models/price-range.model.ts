export interface PriceRangeEntry {
  qty: number;
  price: number;
  bonus: string | null;
}

export interface PriceRange {
  id: string;
  name: string;
  entries: PriceRangeEntry[];
}
