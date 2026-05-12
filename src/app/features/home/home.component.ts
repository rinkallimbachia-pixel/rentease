import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ServiceAreaService } from '../../core/service-area.service';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from '../products/product.service';
import { OrderService } from '../orders/order.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor, ProductCardComponent],
  template: `
    <div class='fade-in space-y-8 pb-4'>
      <!-- Hero: dark card, copy left + room image right -->
      <article
        class='relative overflow-hidden rounded-[1.75rem] bg-re-ink p-6 text-white shadow-re-lg sm:p-8 lg:p-10'
      >
        <div
          class='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_65%_at_10%_30%,rgb(192_94_40/0.28),transparent_58%),radial-gradient(ellipse_50%_50%_at_100%_100%,rgb(255_255_255/0.05),transparent_55%)]'
        ></div>
        <div class='relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-10'>
          <div class='flex min-w-0 flex-col'>
            <span
              class='inline-flex w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-white/95'
            >
              Urban living, on a tenure
            </span>
            <h1
              class='font-serif mt-6 text-[1.65rem] font-semibold leading-[1.18] tracking-tight sm:text-4xl lg:text-[2.4rem]'
            >
              Furnish a home
              <em class='mx-1.5 font-serif text-[1.05em] font-medium italic text-re-accent'>without</em>
              the lock-in.
            </h1>
            <p class='mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-[0.95rem]'>
              Delivery, setup, and monthly payments you can plan around — swap pieces when your lease or roommates change, without
              buying furniture you will not keep.
            </p>
            <div class='mt-8 flex flex-wrap gap-3'>
              <a
                routerLink='/products'
                class='inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-re-ink shadow-sm transition-colors hover:bg-re-canvas'
              >
                Browse the catalog
                <span aria-hidden='true'>→</span>
              </a>
              <a
                routerLink='/dashboard'
                class='inline-flex items-center justify-center rounded-full border-2 border-white/45 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10'
              >
                See my rentals
              </a>
            </div>
          </div>
          <div class='relative min-h-[12rem] lg:min-h-[17rem]'>
            <img
              src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&amp;fit=crop&amp;w=960&amp;q=80'
              alt='Styled living space with furniture'
              class='h-full max-h-[22rem] w-full rounded-2xl object-cover shadow-lg ring-1 ring-white/15 lg:max-h-none lg:min-h-[17rem]'
              loading='lazy'
            />
          </div>
        </div>
      </article>

      <!-- Stats strip -->
      <div class='grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4'>
        <article class='re-panel flex flex-col justify-between p-5 sm:p-6'>
          <p class='re-eyebrow text-re-subtle'>Active rentals</p>
          <p class='font-serif mt-3 text-3xl font-semibold tabular-nums tracking-tight text-re-ink sm:text-4xl'>{{ activeRentals() }}</p>
        </article>
        <article class='re-panel flex flex-col justify-between p-5 sm:p-6'>
          <p class='re-eyebrow text-re-subtle'>SKUs live</p>
          <p class='font-serif mt-3 text-3xl font-semibold tabular-nums tracking-tight text-re-ink sm:text-4xl'>{{ activeSkus() }}</p>
        </article>
        <article class='re-panel flex flex-col justify-between p-5 sm:p-6'>
          <p class='re-eyebrow text-re-subtle'>Service zones</p>
          <p class='font-serif mt-3 text-3xl font-semibold tabular-nums tracking-tight text-re-ink sm:text-4xl'>{{ serviceZones() }}</p>
        </article>
        <article class='re-panel flex flex-col justify-between p-5 sm:p-6'>
          <p class='re-eyebrow text-re-subtle'>Support SLA</p>
          <p class='font-serif mt-3 text-2xl font-semibold tracking-tight text-re-ink sm:text-3xl'>&lt;24h</p>
        </article>
      </div>

      <!-- Featured inventory -->
      <section>
        <div class='flex flex-wrap items-end justify-between gap-4'>
          <h2 class='re-display max-w-xl text-2xl leading-tight sm:text-3xl'>Move-in ready, this week</h2>
          <a routerLink='/products' class='shrink-0 text-sm font-semibold text-re-accent hover:text-re-accent-hover'>All inventory →</a>
        </div>
        <div class='mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          <app-product-card *ngFor='let product of featuredProducts(); trackBy: trackByProductId' [product]='product' />
        </div>
      </section>

      <!-- Journey + trust row -->
      <section class='re-panel-lg space-y-8 p-6 sm:p-8 lg:p-10'>
        <div class='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <p class='re-eyebrow'>The journey</p>
            <h2 class='re-display mt-2 text-2xl sm:text-3xl'>Three steps to a ready home</h2>
          </div>
        </div>
        <div class='grid gap-5 md:grid-cols-3 md:gap-6'>
          <article class='rounded-2xl border border-re-border/80 bg-re-canvas/50 p-6'>
            <span class='font-serif text-3xl font-semibold text-re-accent'>01</span>
            <h3 class='mt-4 text-base font-semibold text-re-ink'>Pick your pieces</h3>
            <p class='mt-2 text-sm leading-relaxed text-re-muted'>
              Curate beds, sofas, and appliances with clear monthly rent and refundable deposits.
            </p>
          </article>
          <article class='rounded-2xl border border-re-border/80 bg-re-canvas/50 p-6'>
            <span class='font-serif text-3xl font-semibold text-re-accent'>02</span>
            <h3 class='mt-4 text-base font-semibold text-re-ink'>Choose your tenure</h3>
            <p class='mt-2 text-sm leading-relaxed text-re-muted'>
              Lock 3, 6, or 12 months — extend when life gets busy or return when you are done.
            </p>
          </article>
          <article class='rounded-2xl border border-re-border/80 bg-re-canvas/50 p-6'>
            <span class='font-serif text-3xl font-semibold text-re-accent'>03</span>
            <h3 class='mt-4 text-base font-semibold text-re-ink'>Schedule delivery</h3>
            <p class='mt-2 text-sm leading-relaxed text-re-muted'>
              Pick a slot that works for you; track handoff, setup, and support from one dashboard.
            </p>
          </article>
        </div>
        <div
          class='flex flex-col gap-6 border-t border-re-border pt-8 text-sm text-re-muted sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-8'
        >
          <p class='flex max-w-xs gap-3 sm:gap-3'>
            <span class='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-re-accent-soft text-re-accent' aria-hidden='true'>✓</span>
            <span><strong class='font-semibold text-re-ink'>Refundable deposits</strong> — held securely and returned when items come back in good shape.</span>
          </p>
          <p class='flex max-w-xs gap-3'>
            <span class='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-re-success-soft text-re-success' aria-hidden='true'>↗</span>
            <span><strong class='font-semibold text-re-ink'>Door-step delivery</strong> — crew brings pieces in, places them, and removes packaging.</span>
          </p>
          <p class='flex max-w-xs gap-3'>
            <span class='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-re-canvas text-re-ink ring-1 ring-re-border' aria-hidden='true'>◇</span>
            <span><strong class='font-semibold text-re-ink'>Built to scale</strong> — inventory and service zones grow as you add cities.</span>
          </p>
        </div>
      </section>

      <p class='text-center text-xs text-re-subtle'>This demo runs entirely in your browser — no database server to configure.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly areaService = inject(ServiceAreaService);

  protected readonly activeRentals = computed(
    () => this.orderService.orders().filter((order) => order.status === 'active').length,
  );
  protected readonly activeSkus = computed(
    () => this.productService.products().filter((product) => product.available).length,
  );
  protected readonly serviceZones = computed(
    () => this.areaService.areas().filter((area) => area.active).length,
  );
  protected readonly featuredProducts = computed(() =>
    this.productService
      .products()
      .filter((product) => product.available)
      .slice(0, 3),
  );

  protected trackByProductId = (_: number, product: { id: string }) => product.id;
}
