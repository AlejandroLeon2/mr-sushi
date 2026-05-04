import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { TemplateCardComponent } from '../components/template-card/template-card';
import { TemplateSectionTitleComponent } from '../components/template-section-title/template-section-title.component';

@Component({
  selector: 'app-block-3',
  standalone: true,
  imports: [TemplateCardComponent, TemplateSectionTitleComponent],
  template: `
    @if (categories().length > 0) {
      <section class="relative py-12  px-8  ">
        <div class="grid grid-cols-1 md:grid-cols-1 gap-x-12 gap-y-16 items-start">
          @for (
            cat of categories();
            track cat.id;
            let isLast = $last;
            let total = $count
          ) {
            <section [id]="'category-' + cat.id" class="flex flex-col">
              <app-template-section-title
                [title]="cat.name"
                [description]="cat.description || ''"
              ></app-template-section-title>

              <div class="grid grid-cols-3 md:grid-cols-5 gap-8">
                @for (product of cat.products; track product.id) {
                  <app-template-card
                    [product]="product"
                    (productClick)="productClick.emit($event)"
                    (addToCart)="addToCart.emit($event)"
                  >
                  </app-template-card>
                }
              </div>
            </section>
          }
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Block3Component {
  categories = input.required<Category[]>();
  templateData = input<any>();
  productClick = output<Product>();
  addToCart = output<Product>();

  protected get images() {
    return this.templateData()?.blocks?.[2]?.block3 || [];
  }

  protected getImageGridClass(): string {
    const count = this.images.length;
    if (count === 1) return 'flex flex-row justify-center items-center gap-4';
    if (count === 2) return 'flex flex-row md:flex-col justify-center items-center gap-4';
    return 'grid grid-cols-1 md:grid-cols-2 gap-4';
  }
}
