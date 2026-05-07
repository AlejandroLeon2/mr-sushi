import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
  ElementRef,
  ViewChild,
  afterNextRender,
  signal,
  DestroyRef,
  inject,
} from '@angular/core';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { TemplateCardComponent } from '../components/template-card/template-card';
import { TemplateSectionTitleComponent } from '../components/template-section-title/template-section-title.component';

interface MakiImage {
  url: string;
  alt: string;
  class: string;
  position: number;
  top: number;
  left?: number;
  leftMobile?: number;
  width?: number;
  height?: number;
}

@Component({
  selector: 'app-block-1',
  standalone: true,
  imports: [TemplateCardComponent, TemplateSectionTitleComponent],
  template: `
    @if (categories().length > 0) {
      <section class="relative py-12 px-8 overflow-hidden">
        <div class="grid grid-cols-4 md:grid-cols-12 gap-x-12  gap-y-16">
          <div #makiContainer class="relative hidden md:block col-span-0 md:col-span-2 h-full">
            <!-- Fila Makis -->
            @for (maki of makisImages(); track maki.url) {
              <img
                [src]="maki.url"
                [alt]="maki.alt"
                [class]="maki.class"
                [style.left.px]="maki.position"
                [style.top.px]="maki.top"
              />
            }
          </div>
          @for (cat of categories(); track cat.id; let isLast = $last; let total = $count) {
            <section [id]="'category-' + cat.id" class="flex col-span-3 flex-col md:col-span-8 ">
              <app-template-section-title
                [title]="cat.name"
                [description]="cat.description || ''"
              ></app-template-section-title>

              <div class="grid grid-cols-2  md:grid-cols-3 gap-8 ">
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
          <div class=" relative  md:block col-span-1 md:col-span-2 h-full">
            <img
              #barcoImage
              src="/images/fila-barco.png"
              alt="Alitas Fondo"
              class="absolute top-0 -right-28 md:-right-48 min-w-[300px] md:min-w-[400px] object-contain will-change-transform transition-transform duration-300 ease-out"
              [style.transform]="barcoTransform()"
            />
          </div>
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Block1Component {
  @ViewChild('makiContainer') makiContainer!: ElementRef<HTMLElement>;
  @ViewChild('barcoImage') barcoImage!: ElementRef<HTMLImageElement>;
  private containerHeight = signal(0);
  private containerWidth = signal(0);
  readonly barcoTransform = signal('');
  private destroyRef = inject(DestroyRef);
  private isTicking = false;

  categories = input.required<Category[]>();
  templateData = input<any>();
  productClick = output<Product>();
  addToCart = output<Product>();

  constructor() {
    afterNextRender(() => {
      this.updateContainerDimensions();
      window.addEventListener('resize', this.updateContainerDimensions);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', this.updateContainerDimensions);
        window.removeEventListener('scroll', this.onScroll);
      });
    });
  }

  private updateContainerDimensions = () => {
    if (this.makiContainer?.nativeElement) {
      this.containerHeight.set(this.makiContainer.nativeElement.offsetHeight);
      this.containerWidth.set(this.makiContainer.nativeElement.offsetWidth);
    }
  };

  private onScroll = () => {
    if (!this.isTicking) {
      window.requestAnimationFrame(() => {
        this.updateParallax();
        this.isTicking = false;
      });
      this.isTicking = true;
    }
  };

  private updateParallax() {
    if (!this.barcoImage?.nativeElement) return;

    const container = this.barcoImage.nativeElement.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const containerHeight = container.offsetHeight;
    const imageHeight = this.barcoImage.nativeElement.offsetHeight;

    // Solo calcular si el contenedor está en rango de visibilidad
    if (containerRect.bottom < 0 || containerRect.top > viewportHeight) return;

    // Rango de movimiento de la imagen dentro del contenedor
    const maxOffset = containerHeight - imageHeight;

    // RANGO DE SCROLL SINCRONIZADO:
    // Inicio: 50% de la imagen visible desde abajo
    const startScrollTop = viewportHeight - (imageHeight * 0.8);
    // Fin: El fondo del contenedor llega al fondo del viewport
    const endScrollTop = viewportHeight - containerHeight;

    const scrollRange = Math.max(1, startScrollTop - endScrollTop);
    const currentScroll = startScrollTop - containerRect.top;

    // Proporción lineal base (0 a 1)
    const linearRatio = currentScroll / scrollRange;

    // AJUSTE PROGRESIVO (Sugerencia del usuario):
    // Aplicamos una curva de compensación para que la imagen no se quede atrás al inicio.
    // Usamos una curva que empieza más rápido y se estabiliza al final (Ease-Out).
    // f(x) = x * (1.6 - 0.6 * x) -> Aceleración inicial compensatoria
    const compensatedProgress = linearRatio * (1.6 - 0.6 * linearRatio);

    let progress = Math.max(0, Math.min(1, compensatedProgress));

    // Calculamos el offset final
    const offset = progress * maxOffset;

    this.barcoTransform.set(`translateY(${offset}px)`);
  }

  private readonly baseMakiImages: Omit<MakiImage, 'position' | 'top'>[] = [
    {
      url: '/images/fila-maki2.png',
      alt: 'Maki 2',
      class: 'absolute min-w-[500px] ',
      left: -160,
      leftMobile: -225,
    },
    {
      url: '/images/fila-maki1.png',
      alt: 'Maki 1',
      class: 'absolute min-w-[500px] ',
      left: -160,
      leftMobile: -225,
    },

    {
      url: '/images/fila-maki3.png',
      alt: 'Maki 3',
      class: 'absolute min-w-[500px] ',
      left: -160,
      leftMobile: -225,
    },
  ];

  private readonly makiConfig = {
    imageWidth: 500,
    imageHeight: 720,
    mobileBreakpoint: 468,
  };


  readonly makisImages = computed(() => {
    const { imageHeight, imageWidth, mobileBreakpoint } = this.makiConfig;
    const containerHeight = this.containerHeight();
    const containerWidth = this.containerWidth();

    if (containerHeight === 0 || containerWidth === 0) return [];

    const isMobile = containerWidth < mobileBreakpoint;
    const totalImages = this.baseMakiImages.length;

    // Calcular cuántas imágenes caben completamente en el contenedor
    const maxImages = Math.floor(containerHeight / imageHeight);
    const result: MakiImage[] = [];

    for (let index = 0; index < maxImages; index++) {
      const baseIndex = index % totalImages;
      const positionY = index * imageHeight;

      const img = this.baseMakiImages[baseIndex];
      const positionX = isMobile ? (img.leftMobile ?? img.left ?? 0) : (img.left ?? 0);

      result.push({
        ...img,
        position: positionX,
        top: positionY,
        width: imageWidth,
        height: imageHeight,
      });
    }

    return result;
  });
}
