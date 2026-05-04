import { ChangeDetectionStrategy, Component, input, output, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingBag, Plus, Minus, X, MessageCircle, Star } from 'lucide-angular';
import { Product } from '../../../core/models/product.model';
import { PrecioPipe } from '../../../core/pipes/precio.pipe';
import { DataStoreService } from '../../../core/services/data-store.service';
import { MenuService } from '../../../core/services/menu.service';
import { PriceRange, PriceRangeEntry } from '../../../core/models/price-range.model';

@Component({
  selector: 'app-chifa-product-detail',
  standalone: true,
  imports: [LucideAngularModule, PrecioPipe, CommonModule],
  templateUrl: './product-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChifaProductDetail implements OnInit {
  product = input.required<Product>();
  addToCart = output<{ product: Product, quantity: number, selectedEntry?: PriceRangeEntry }>();
  close = output<void>();

  private readonly dataStore = inject(DataStoreService);
  private readonly menuService = inject(MenuService);
  
  quantity = signal(1);
  priceRange = signal<PriceRange | null>(null);
  selectedEntry = signal<PriceRangeEntry | null>(null);

  // Icons
  ShoppingBag = ShoppingBag;
  Plus = Plus;
  Minus = Minus;
  X = X;
  MessageCircle = MessageCircle;
  Star = Star;

  ngOnInit(): void {
    const rangeId = this.product().price_range_id;
    if (rangeId) {
      this.menuService.getPriceRanges().subscribe(response => {
        const range = response.price_ranges.find(r => r.id === rangeId);
        if (range) {
          this.priceRange.set(range);
          // Auto-select first entry
          if (range.entries.length > 0) {
            this.selectedEntry.set(range.entries[0]);
          }
        }
      });
    }
  }

  currentPrice = computed(() => {
    const entry = this.selectedEntry();
    if (entry) return entry.price;
    return this.product().price ?? 0;
  });

  increase() { this.quantity.update(q => q + 1); }
  decrease() { if (this.quantity() > 1) this.quantity.update(q => q - 1); }
  
  selectEntry(entry: PriceRangeEntry) {
    this.selectedEntry.set(entry);
  }

  onAddToCart() { 
    this.addToCart.emit({ 
      product: this.product(), 
      quantity: this.quantity(),
      selectedEntry: this.selectedEntry() ?? undefined
    }); 
    this.close.emit();
  }

  orderViaWhatsApp() {
    const settings = this.dataStore.activeSettings();
    const phone = settings?.whatsapp_config?.number;
    if (!phone) return;

    let message = `Hola, quisiera pedir ${this.quantity()}x ${this.product().name}`;
    
    const entry = this.selectedEntry();
    if (entry) {
      message += ` (${entry.qty} unds - S/ ${entry.price})`;
      if (entry.bonus) message += ` + ${entry.bonus}`;
    }

    message += ` del menú.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}
