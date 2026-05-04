import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-primary/10 shadow-sm py-4 px-4">
      <div class="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        @for (catData of categories(); track catData.category.id) {
          <a [routerLink]="['/menu']" 
             [fragment]="'category-' + catData.category.id"
             routerLinkActive="!bg-primary !text-white"
             [routerLinkActiveOptions]="{ exact: false, fragment: 'exact' }"
             class="whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all bg-secondary/5 text-secondary hover:bg-primary/20 hover:text-primary active:scale-95">
            {{ catData.category.name }}
          </a>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryNav {
  categories = input.required<any[]>();
}
