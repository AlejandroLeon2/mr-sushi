import { Product } from './product.model';

export interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  products: Product[];
}
