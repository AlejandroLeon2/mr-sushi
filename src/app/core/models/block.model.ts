import { Category } from './category.model';

export interface Block {
  id: string;
  name: string;
  sort_order: number;
  categories: Category[];
}
