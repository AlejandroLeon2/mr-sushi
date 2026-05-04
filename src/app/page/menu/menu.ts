import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Block } from '../../core/models/block.model';
import { BaseTemplate } from '../../base-template';
import { CommonModule } from '@angular/common';

// UI Components
import { SidebarCart } from '../../components/sidebar-cart/sidebar-cart.component';
import { CartTriggerComponent } from '../../components/cart-trigger/cart-trigger.component';
import { RestaurantClosedModalComponent } from '../../components/restaurant-closed-modal/restaurant-closed-modal.component';
import { CategoryNav } from '../../components/category-nav/category-nav.component';
import { ChifaProductDetail } from '../../base-template/components/product-detail/product-detail';
import { WhatsAppButton } from '../../components/whatsapp-button/whatsapp-button.component';

// Services
import { Cart } from '../../core/services/cart.service';
import { BusinessHoursService } from '../../core/services/business-hours.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    BaseTemplate, 
    CommonModule, 
    SidebarCart, 
    CartTriggerComponent, 
    RestaurantClosedModalComponent,
    CategoryNav,
    ChifaProductDetail,
    WhatsAppButton
  ],
  templateUrl: './menu.html'
})
export class Menu implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly restaurantService = inject(RestaurantService);
  private readonly _cart = inject(Cart);
  private readonly _businessHours = inject(BusinessHoursService);
  
  // UI State
  readonly selectedProduct = signal<any | null>(null);

  // Data signals
  readonly blocks = signal<Block[]>([]);
  readonly combos = signal<any[]>([]);
  readonly promotions = signal<any[]>([]);

  readonly allCategories = computed(() => {
    return this.blocks().flatMap(block => block.categories.map(cat => ({ category: cat })));
  });

  // Service exposure
  readonly isCartOpen = this._cart.isOpen;
  readonly isRestaurantClosed = this._cart.isBusinessClosed;
  readonly businessHours = this._businessHours.rawHours;

  ngOnInit(): void {
    this.menuService.getMenuData().subscribe((response) => {
      if (response && response.menu) {
        if (response.menu.blocks) {
          // Sort blocks by sort_order
          const sortedBlocks = [...response.menu.blocks].sort((a, b) => a.sort_order - b.sort_order);
          this.blocks.set(sortedBlocks);
        }
        if (response.menu.combos) {
          this.combos.set(response.menu.combos);
        }
        if (response.menu.promotions) {
          this.promotions.set(response.menu.promotions);
        }
      }
    });
  }

  onProductClick(product: any): void {
    this.selectedProduct.set(product);
  }

  onAddToCart(product: any, quantity: number = 1, selectedEntry?: any): void {
    this._cart.addItem(product as any, quantity, selectedEntry);
  }

  closeProductDetail(): void {
    this.selectedProduct.set(null);
  }

  closeClosedModal(): void {
    this._cart.closeBusinessClosedModal();
  }
}
