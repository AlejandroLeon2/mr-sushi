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
  NgZone,
  OnInit,
} from '@angular/core';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { TemplateCardComponent } from '../components/template-card/template-card';
import { TemplateSectionTitleComponent } from '../components/template-section-title/template-section-title.component';
import { MenuService } from '../../core/services/menu.service';

// Local data import
import templateImagesLocal from '../../data/template-images.json';

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
            <!-- Fila Makis con posicionamiento calculado -->
            @for (maki of makisImages(); track $index) {
              <img
                [src]="maki.url"
                [alt]="maki.alt"
                class="absolute min-w-[500px]"
                [style.top.px]="maki.top"
                [style.left.px]="maki.position"
              />
            }
          </div>
          @for (cat of categories(); track cat.id; let isLast = $last; let total = $count) {
            <section [id]="'category-' + cat.id" class="flex col-span-3 flex-col md:col-span-8 ">
              <app-template-section-title
                [title]="cat.name"
                [description]="cat.description || ''"
              ></app-template-section-title>
1: 
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
              [src]="barcoImageUrl()"
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
export class Block1Component implements OnInit {
  @ViewChild('makiContainer') makiContainer!: ElementRef<HTMLElement>;
  @ViewChild('barcoImage') barcoImage!: ElementRef<HTMLImageElement>;
  private containerHeight = signal(0);
  private containerWidth = signal(0);
  readonly barcoTransform = signal('');
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly menuService = inject(MenuService);

  private isTicking = false;
  private containerResizeObserver: ResizeObserver | null = null;

  categories = input.required<Category[]>();
  templateData = input<any>();
  productClick = output<Product>();
  addToCart = output<Product>();

  // Default values from local JSON
  barcoImageUrl = signal(templateImagesLocal.data.block1.barco);
  makiImages = signal<string[]>(templateImagesLocal.data.block1.makis);

  ngOnInit(): void {
    this.menuService.getTemplateImages().subscribe((data) => {
      if (data?.data?.block1) {
        this.barcoImageUrl.set(data.data.block1.barco);
        this.makiImages.set(data.data.block1.makis);
      }
    });
  }

  constructor() {
    afterNextRender(() => {
      this.updateContainerDimensions();
      this.setupResizeObserver();

      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('resize', this.updateContainerDimensions, { passive: true });
        window.addEventListener('scroll', this.onScroll, { passive: true });
      });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', this.updateContainerDimensions);
        window.removeEventListener('scroll', this.onScroll);
        this.containerResizeObserver?.disconnect();
      });
    });
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;
    const el = this.makiContainer?.nativeElement?.parentElement;
    if (!el) return;

    this.ngZone.runOutsideAngular(() => {
      this.containerResizeObserver = new ResizeObserver(() => {
        this.ngZone.run(() => this.updateContainerDimensions());
      });
      this.containerResizeObserver.observe(el);
    });
  }

  private updateContainerDimensions = () => {
    const el = this.makiContainer?.nativeElement;
    if (!el) return;
    this.containerHeight.set(el.offsetHeight);
    this.containerWidth.set(el.offsetWidth);
    this.updateParallax();
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

    const startScrollTop = viewportHeight - imageHeight * 0.8;
    const endScrollTop = viewportHeight - containerHeight;

    const scrollRange = Math.max(1, startScrollTop - endScrollTop);
    const currentScroll = startScrollTop - containerRect.top;

    const linearRatio = currentScroll / scrollRange;

    // Curva ease-out: empieza más rápido y se estabiliza al final
    const compensatedProgress = linearRatio * (1.6 - 0.6 * linearRatio);
    const progress = Math.max(0, Math.min(1, compensatedProgress));
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
    const urls = this.makiImages();

    if (containerHeight === 0 || containerWidth === 0 || urls.length === 0) return [];

    const isMobile = containerWidth < mobileBreakpoint;
    const maxImages = Math.floor(containerHeight / imageHeight) + 1; // +1 to ensure overlap/fill
    const result: MakiImage[] = [];

    for (let index = 0; index < maxImages; index++) {
      const urlIndex = index % urls.length;
      const baseMakiIndex = index % this.baseMakiImages.length;
      const positionY = index * imageHeight;

      const img = this.baseMakiImages[baseMakiIndex];
      const positionX = isMobile ? (img.leftMobile ?? img.left ?? 0) : (img.left ?? 0);

      result.push({
        ...img,
        url: urls[urlIndex], // Use dynamic URL from signal
        position: positionX,
        top: positionY,
        width: imageWidth,
        height: imageHeight,
      });
    }

    return result;
  });
}
