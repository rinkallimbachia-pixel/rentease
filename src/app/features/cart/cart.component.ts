import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { InrPipe } from '../../shared/pipes/inr.pipe';
import { CartService } from './cart.service';
import { ProductService } from '../products/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, InrPipe, RouterLink],
  template: `
    <section class="fade-in space-y-6">
      <header class="re-panel-lg p-6 sm:p-8">
        <p class="re-eyebrow text-re-subtle">Cart</p>
        <h1 class="re-display mt-2 text-3xl">Your selection</h1>
        <p class="mt-2 text-sm text-re-muted">Adjust quantity and tenure before you schedule delivery at checkout.</p>
      </header>

      <form *ngIf="vm() as vm" #cartForm="ngForm" class="space-y-4">
        <article
          *ngFor="let item of vm.items; trackBy: trackByProduct"
          class="re-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0 flex-1">
            <h2 class="font-serif text-lg font-semibold text-re-ink">{{ item.product.name }}</h2>
            <p class="mt-1 text-sm text-re-muted">{{ item.product.pricePerMonth | inr }} per month · deposit {{ item.product.deposit | inr }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="grid gap-1">
              <input
                [ngModel]="item.quantity"
                (ngModelChange)="updateQuantity(item.product.id, $event)"
                type="number"
                required
                min="1"
                max="99"
                step="1"
                [name]="'cartQty_' + item.product.id"
                #qtyCtrl="ngModel"
                class="re-input !w-24 !py-2"
              />
              <p *ngIf="qtyCtrl.invalid && qtyCtrl.touched" class="text-xs text-re-danger">Enter a quantity from 1 to 99.</p>
            </div>
            <select
              [ngModel]="item.tenure"
              (ngModelChange)="update(item.product.id, 'tenure', $event)"
              required
              [name]="'cartTenure_' + item.product.id"
              class="re-input !w-auto !min-w-[8rem] !py-2"
            >
              <option *ngFor="let option of item.product.tenureOptions" [ngValue]="option">{{ option }} mo</option>
            </select>
            <button
              type="button"
              (click)="remove(item.product.id)"
              class="rounded-full border border-re-danger/30 px-3 py-2 text-sm font-semibold text-re-danger hover:bg-re-danger-soft"
            >
              Remove
            </button>
          </div>
        </article>

        <div class="re-panel-lg flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-re-subtle">Estimated total</p>
            <p class="font-serif mt-1 text-2xl font-semibold text-re-ink">{{ vm.total | inr }}</p>
            <p class="mt-1 text-xs text-re-muted">Based on monthly rent × quantity × tenure (demo calculation).</p>
          </div>
          <button type="button" (click)="goCheckout(cartForm)" class="re-btn-primary shrink-0 sm:min-w-[200px]">Proceed to checkout</button>
        </div>
      </form>

      <p *ngIf="!vm().items.length" class="re-panel border-dashed p-10 text-center text-sm text-re-muted">
        Your cart is empty. <a routerLink="/products" class="font-semibold text-re-accent hover:underline">Browse catalog</a>
      </p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  protected readonly vm = computed(() => {
    const cart = this.cartService.cartItems();
    const products = this.productService.products();
    const items = cart
      .map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) }))
      .filter((item) => item.product)
      .map((item) => ({ ...item, product: item.product! }));

    const total = items.reduce((sum, item) => sum + item.product.pricePerMonth * item.quantity * item.tenure, 0);
    return { items, total };
  });

  protected update(productId: string, key: 'quantity' | 'tenure', value: number): void {
    this.cartService.updateItem(productId, { [key]: Number(value) }).subscribe();
  }

  protected updateQuantity(productId: string, raw: number | string): void {
    const n = Math.trunc(Number(raw));
    const q = Number.isFinite(n) ? Math.min(99, Math.max(1, n)) : 1;
    this.cartService.updateItem(productId, { quantity: q }).subscribe();
  }

  protected goCheckout(form: NgForm): void {
    form.control.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    this.router.navigateByUrl('/checkout');
  }

  protected remove(productId: string): void {
    this.cartService.removeItem(productId).subscribe();
  }

  protected trackByProduct = (_: number, item: { product: { id: string } }) => item.product.id;
}
