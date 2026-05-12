import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { CartService } from '../cart/cart.service';
import { Product } from '../../shared/models/entities';
import { ProductService } from './product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, InrPipe, RouterLink],
  template: `
    <section *ngIf="product() as product" class="fade-in grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <article class="re-panel-lg overflow-hidden p-0">
        <img
          [src]="product.image"
          [alt]="product.name"
          (error)="onImageError($event, product.category)"
          class="h-72 w-full rounded-t-[1.65rem] object-cover sm:h-80 lg:h-[min(32rem,70vh)]"
        />
      </article>
      <article class="re-panel-lg space-y-5 p-6 sm:p-8">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-re-badge-tan px-3 py-1 text-xs font-semibold uppercase tracking-wide text-re-ink">{{
            product.category
          }}</span>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            [class.bg-re-badge-sage]="product.available"
            [class.text-re-success]="product.available"
            [class.bg-re-danger-soft]="!product.available"
            [class.text-re-danger]="!product.available"
          >
            {{ product.available ? 'Available' : 'Out of stock' }}
          </span>
        </div>
        <h1 class="re-display text-3xl sm:text-4xl">{{ product.name }}</h1>
        <p class="text-sm leading-relaxed text-re-muted">
          Clear monthly pricing and a refundable deposit. Select tenure and quantity here; extend or request service anytime from your
          dashboard after checkout.
        </p>
        <div class="flex flex-wrap gap-8 border-y border-re-border py-4">
          <div>
            <p class="re-eyebrow text-re-subtle">Monthly</p>
            <p class="mt-1 font-serif text-2xl font-semibold text-re-accent">{{ product.pricePerMonth | inr }}</p>
          </div>
          <div>
            <p class="re-eyebrow text-re-subtle">Deposit</p>
            <p class="mt-1 font-serif text-2xl font-semibold text-re-ink">{{ product.deposit | inr }}</p>
          </div>
        </div>
        <form #detailForm="ngForm" class="grid gap-4" (ngSubmit)="onDetailSubmit($event, product, detailForm)">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="re-eyebrow mb-1.5 block text-re-subtle" for="pd-tenure">Tenure (months)</label>
              <select id="pd-tenure" [(ngModel)]="tenure" name="tenure" required class="re-input !py-2.5" #tenureCtrl="ngModel">
                <option *ngFor="let option of product.tenureOptions" [ngValue]="option">{{ option }} months</option>
              </select>
              <p *ngIf="tenureCtrl.invalid && tenureCtrl.touched" class="mt-1 text-xs text-re-danger">Choose a tenure.</p>
            </div>
            <div>
              <label class="re-eyebrow mb-1.5 block text-re-subtle" for="pd-qty">Quantity</label>
              <input
                id="pd-qty"
                [(ngModel)]="quantity"
                name="qty"
                type="number"
                required
                min="1"
                max="99"
                step="1"
                class="re-input !py-2.5"
                #qtyCtrl="ngModel"
              />
              <p *ngIf="qtyCtrl.invalid && qtyCtrl.touched" class="mt-1 text-xs text-re-danger">Enter a quantity from 1 to 99.</p>
            </div>
          </div>
          <div class="rounded-2xl border border-re-border bg-re-accent-soft/60 px-4 py-4">
            <p class="re-eyebrow text-re-ink">Estimated rental</p>
            <p class="mt-1 font-serif text-2xl font-semibold text-re-ink">{{ estimatedRental() | inr }}</p>
            <p class="mt-1 text-xs text-re-muted">
              {{ product.pricePerMonth | inr }} × {{ quantity }} × {{ tenure }} mo
            </p>
          </div>
          <a
            *ngIf="!currentUser()"
            routerLink="/login"
            [queryParams]="{ returnUrl: '/products/' + product.id }"
            class="re-btn-primary block w-full text-center"
            >Sign in to rent</a
          >
          <button *ngIf="currentUser()" type="submit" [disabled]="!product.available" class="re-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
            Add to cart
          </button>
        </form>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  protected readonly product = signal<Product | null>(null);
  protected readonly currentUser = this.authService.currentUser;
  protected tenure = 3;
  protected quantity = 1;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/products');
      return;
    }

    this.productService.getById(id).subscribe((product) => {
      if (!product) {
        this.router.navigateByUrl('/products');
        return;
      }
      this.product.set(product);
      this.tenure = product.tenureOptions[0];
    });
  }

  protected estimatedRental(): number {
    const p = this.product();
    if (!p) {
      return 0;
    }
    return p.pricePerMonth * Math.max(1, Number(this.quantity) || 1) * (Number(this.tenure) || 1);
  }

  protected onDetailSubmit(event: SubmitEvent, product: Product, form: NgForm): void {
    if (!this.currentUser()) {
      event.preventDefault();
      return;
    }
    this.addToCart(product, form);
  }

  protected addToCart(product: Product, form: NgForm): void {
    form.control.markAllAsTouched();
    if (form.invalid || !product.available) {
      return;
    }
    const q = Math.min(99, Math.max(1, Math.trunc(Number(this.quantity))));
    this.quantity = q;
    this.cartService.addToCart({ productId: product.id, quantity: q, tenure: this.tenure }).subscribe(() => this.router.navigateByUrl('/cart'));
  }

  protected onImageError(event: Event, category: Product['category']): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.includes('category-appliance.svg') || image.src.includes('category-furniture.svg')) {
      return;
    }
    image.src = category === 'Appliance' ? 'assets/category-appliance.svg' : 'assets/category-furniture.svg';
  }
}
