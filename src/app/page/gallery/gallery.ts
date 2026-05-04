import { ChangeDetectionStrategy, Component, signal, OnInit, inject, computed } from '@angular/core';
import { LucideAngularModule, Image as ImageIcon, Play } from 'lucide-angular';
import { TemplateHeader } from '../../base-template/components/header/header';
import { TemplateFooter } from '../../base-template/components/footer/footer';
import { ImageModalComponent, GalleryImage } from '../../components/image-modal/image-modal.component';
import galleryData from '../../data/gallery.json';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [LucideAngularModule, TemplateHeader, TemplateFooter, ImageModalComponent],
  template: `
    <app-template-header></app-template-header>

    <main class="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      
      <!-- Page Title -->
      <div class="flex flex-col items-center text-center space-y-4 ">
        <h2 class="text-6xl md:text-8xl font-display  tracking-tighter">
          Momentos <span class="text-primary">{{ restaurantName() }}</span>
        </h2>
        <p class="text-white/40 italic max-w-xl mx-auto">
          Un vistazo a nuestras creaciones más frescas y el ambiente que nos hace únicos.
        </p>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (item of items(); track item.id; let i = $index) {
          <div (click)="openMedia(i)" 
               class="group relative aspect-square overflow-hidden rounded-sm bg-secondary border border-white/5 cursor-pointer shadow-2xl">
            
            <img [src]="item.type === 'image' ? item.url : item.thumbnailUrl" 
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 alt="Gallery item">

            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
              <h4 class="text-2xl font-display text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                {{ item.title }}
              </h4>
              <p class="text-white/60 text-xs mt-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                {{ item.description }}
              </p>
            </div>

            <!-- View/Play Icon -->
            <div class="absolute top-6 right-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500 delay-150 shadow-xl">
               @if (item.type === 'image') {
                 <lucide-icon [img]="ImageIcon" class="w-6 h-6"></lucide-icon>
               } @else {
                 <lucide-icon [img]="Play" class="w-6 h-6 ml-1"></lucide-icon>
               }
            </div>
            
            <!-- Video Badge Indicator -->
            @if (item.type !== 'image') {
              <div class="absolute top-6 left-6 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <lucide-icon [img]="Play" class="w-3 h-3 text-white"></lucide-icon>
                <span class="text-[10px] text-white font-bold uppercase tracking-wider">Video</span>
              </div>
            }
          </div>
        }
      </div>
    </main>

    <app-template-footer></app-template-footer>

    <!-- Modal -->
    <app-image-modal 
      [images]="items()" 
      [initialIndex]="selectedIndex()" 
      [isOpen]="isModalOpen()" 
      (close)="isModalOpen.set(false)">
    </app-image-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryPage implements OnInit {
  private readonly _restaurantService = inject(RestaurantService);
  readonly restaurantName = computed(() => this._restaurantService.restaurant()?.name ?? 'Mr Sushi');

  items = signal<GalleryImage[]>([]);
  selectedIndex = signal(0);
  isModalOpen = signal(false);

  readonly ImageIcon = ImageIcon;
  readonly Play = Play;

  ngOnInit() {
    this.items.set(galleryData.gallery as GalleryImage[]);
  }

  openMedia(index: number) {
    this.selectedIndex.set(index);
    this.isModalOpen.set(true);
  }
}
