import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { ProductCategory } from '../../shared/models/entities';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from './product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor, AsyncPipe, ProductCardComponent, NgIf],
  template: `
    <section class="fade-in space-y-6">
      <header class="re-panel-lg p-6 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="re-eyebrow text-re-subtle">Catalog</p>
            <h1 class="re-display mt-2 text-3xl sm:text-[2.125rem]">Browse the inventory</h1>
            <p class="mt-2 max-w-xl text-sm leading-relaxed text-re-muted">
              Furniture and appliances with monthly rent, refundable deposit, and flexible tenure — filter by category below.
            </p>
          </div>
        </div>
        <div class="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            (click)="setFilter('all')"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
            [class.border-re-ink]="filter() === 'all'"
            [class.bg-re-ink]="filter() === 'all'"
            [class.text-white]="filter() === 'all'"
            [class.border-re-border]="filter() !== 'all'"
            [class.bg-re-surface]="filter() !== 'all'"
            [class.text-re-muted]="filter() !== 'all'"
            [class.hover:bg-re-canvas]="filter() !== 'all'"
          >
            All
          </button>
          <button
            type="button"
            (click)="setFilter('Furniture')"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
            [class.border-re-ink]="filter() === 'Furniture'"
            [class.bg-re-ink]="filter() === 'Furniture'"
            [class.text-white]="filter() === 'Furniture'"
            [class.border-re-border]="filter() !== 'Furniture'"
            [class.bg-re-surface]="filter() !== 'Furniture'"
            [class.text-re-muted]="filter() !== 'Furniture'"
            [class.hover:bg-re-canvas]="filter() !== 'Furniture'"
          >
            Furniture
          </button>
          <button
            type="button"
            (click)="setFilter('Appliance')"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
            [class.border-re-ink]="filter() === 'Appliance'"
            [class.bg-re-ink]="filter() === 'Appliance'"
            [class.text-white]="filter() === 'Appliance'"
            [class.border-re-border]="filter() !== 'Appliance'"
            [class.bg-re-surface]="filter() !== 'Appliance'"
            [class.text-re-muted]="filter() !== 'Appliance'"
            [class.hover:bg-re-canvas]="filter() !== 'Appliance'"
          >
            Appliances
          </button>
        </div>
      </header>

      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" *ngIf="products$ | async as products">
        <app-product-card *ngFor="let product of products; trackBy: trackById" [product]="product" />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  private readonly productService = inject(ProductService);
  protected readonly filter = signal<ProductCategory | 'all'>('all');
  protected products$ = this.productService.getProducts('all');

  protected setFilter(filter: ProductCategory | 'all'): void {
    this.filter.set(filter);
    this.products$ = this.productService.getProducts(filter);
  }

  protected trackById = (_: number, product: { id: string }) => product.id;
}
