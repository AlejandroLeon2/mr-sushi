import { ChangeDetectionStrategy, Component, input, output, inject, signal, OnInit } from '@angular/core';
import { LucideAngularModule, ThumbsUp, Utensils, Star, Plus, ShoppingBag } from 'lucide-angular';
import { Product } from '../../../core/models/product.model';
import { PrecioPipe } from '../../../core/pipes/precio.pipe';
import { AddButtonComponent } from '../add-button/add-button.component';
import { MenuService } from '../../../core/services/menu.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-template-card',
  standalone: true,
  imports: [LucideAngularModule, PrecioPipe, AddButtonComponent, CommonModule],
  templateUrl: './template-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateCardComponent implements OnInit {
  product = input.required<Product>();
  productClick = output<Product>();
  addToCart = output<Product>();

  private readonly menuService = inject(MenuService);

  hasPriceRange = signal(false);
  startingPrice = signal<number | null>(null);

  Utensils = Utensils;
  Star = Star;
  Plus = Plus;
  ThumbsUp = ThumbsUp;
  ShoppingBag = ShoppingBag;

  ngOnInit(): void {
    const rangeId = this.product().price_range_id;
    if (rangeId) {
      this.hasPriceRange.set(true);
      this.menuService.getPriceRanges().subscribe(response => {
        const range = response.price_ranges.find(r => r.id === rangeId);
        if (range && range.entries.length > 0) {
          // Find the lowest price
          const prices = range.entries.map(e => e.price);
          this.startingPrice.set(Math.min(...prices));
        }
      });
    } else {
      this.startingPrice.set(this.product().price);
    }
  }

  onAddClick(event: Event) {
    event.stopPropagation();
    if (this.hasPriceRange()) {
      // If it has price ranges, we MUST open the detail modal to let them choose
      this.productClick.emit(this.product());
    } else {
      this.addToCart.emit(this.product());
    }
  }
}
