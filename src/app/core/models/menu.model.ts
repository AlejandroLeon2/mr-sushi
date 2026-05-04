import { Block } from './block.model';
import { PriceRange } from './price-range.model';

export interface Menu {
  blocks: Block[];
  combos?: any[];
  promotions?: any[];
}

/**
 * Representa la estructura de menu_render.json
 */
export interface MenuResponse {
  menu: Menu;
}

/**
 * Representa la estructura de price_ranges.json
 */
export interface PriceRangesResponse {
  price_ranges: PriceRange[];
}
