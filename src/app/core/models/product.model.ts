/**
 * Interfaz para los productos del menú.
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  qty_label: string | null;
  price: number | null;
  price_range_id: string | null;
  is_favorite: boolean;
  is_recommended?: boolean;
  is_hidden: boolean;
  image_url: string | null;
  tags: string[];
}
