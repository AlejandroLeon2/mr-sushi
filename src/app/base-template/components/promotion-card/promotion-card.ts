import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { LucideAngularModule, Plus } from 'lucide-angular';
import { PrecioPipe } from '../../../core/pipes/precio.pipe';
import { AddButtonComponent } from '../add-button/add-button.component';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  cloudinary_id: string;
  url: string;
}

@Component({
  selector: 'app-promotion-card',
  standalone: true,
  imports: [LucideAngularModule, PrecioPipe, AddButtonComponent],
  templateUrl: './promotion-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionCardComponent {
  promotion = input.required<Promotion>();
  addToCart = output<Promotion>();

  Plus = Plus;
}
