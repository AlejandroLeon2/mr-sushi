import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
  signal,
  OnInit,
} from '@angular/core';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { TemplateCardComponent } from '../components/template-card/template-card';
import { TemplateSectionTitleComponent } from '../components/template-section-title/template-section-title.component';
import { MenuService } from '../../core/services/menu.service';

@Component({
  selector: 'app-block-3',
  standalone: true,
  imports: [TemplateCardComponent, TemplateSectionTitleComponent],
  template: `
    @if (categories().length > 0) {
      <section class="relative py-12  px-8  overflow-hidden  ">
        <div class="relative grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-8 items-start">
          <div class=" justify-between flex col-span-12 h-60  md:col-span-12 md:h-0">
            <img
              [src]="alitasFondo()"
              alt="Alitas Fondo"
              class="h-full md:h-auto md:w-130 md:absolute top-10 -right-35"
            />
            <img
              [src]="alitas2Fondo()"
              alt="Alitas 2 Fondo"
              class="h-full md:h-auto md:w-130 md:absolute bottom-10 -right-35"
            />
          </div>
          @for (cat of categories(); track cat.id; let isLast = $last; let total = $count) {
            <section [id]="'category-' + cat.id" class="flex flex-col col-span-12 md:col-span-8 ">
              <app-template-section-title
                [title]="cat.name"
                [description]="cat.description || ''"
              ></app-template-section-title>

              <div class="grid grid-cols-3 md:grid-cols-4 gap-6">
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
export class Block3Component implements OnInit {
  private readonly menuService = inject(MenuService);

  categories = input.required<Category[]>();
  templateData = input<any>();
  productClick = output<Product>();
  addToCart = output<Product>();

  alitasFondo = signal('/images/alitas-fondo.png');
  alitas2Fondo = signal('/images/alitas-2-fondo.png');

  ngOnInit(): void {
    this.menuService.getTemplateImages().subscribe((data) => {
      if (data.data?.block3) {
        this.alitasFondo.set(data.data.block3.alitasFondo);
        this.alitas2Fondo.set(data.data.block3.alitas2Fondo);
      }
    });
  }

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
