import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { ServiceAreaService } from '../../core/service-area.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../products/product.service';
import { OrderService } from './order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, InrPipe],
  template: `
    <section class="fade-in mx-auto max-w-xl">
      <div class="re-panel-lg p-6 sm:p-8">
        <p class="re-eyebrow text-re-subtle">Checkout</p>
        <h1 class="re-display mt-2 text-3xl">Schedule delivery</h1>
        <p class="mt-2 text-sm leading-relaxed text-re-muted">
          Pick a delivery date. Payment gateway is not wired in this demo — placing an order records it locally.
        </p>

        <form #checkoutForm="ngForm" class="mt-8 space-y-4" (ngSubmit)="confirm(checkoutForm)">
          <p *ngIf="checkoutError()" class="rounded-xl border border-re-danger/30 bg-re-danger-soft px-3 py-2 text-sm text-re-danger">
            {{ checkoutError() }}
          </p>

          <div>
            <label class="re-eyebrow mb-1.5 block text-re-subtle" for="checkout-area">Service area</label>
            <select
              id="checkout-area"
              [(ngModel)]="serviceAreaId"
              name="serviceArea"
              required
              class="re-input"
              #areaCtrl="ngModel"
              [disabled]="!activeAreas().length"
            >
              <option [ngValue]="''" disabled>Choose an area</option>
              <option *ngFor="let area of activeAreas()" [ngValue]="area.id">{{ area.city }} - {{ area.zone }}</option>
            </select>
            <p *ngIf="areaCtrl.invalid && areaCtrl.touched" class="mt-1 text-xs text-re-danger">Select a service area.</p>
            <p *ngIf="!activeAreas().length" class="mt-1 text-xs text-re-muted">No active service areas — contact support.</p>
          </div>

          <div>
            <label class="re-eyebrow mb-1.5 block text-re-subtle" for="checkout-location">Delivery location</label>
            <input
              id="checkout-location"
              [(ngModel)]="deliveryLocation"
              name="deliveryLocation"
              required
              minlength="3"
              maxlength="300"
              pattern=".*\\S.*"
              placeholder="Flat / Building / Landmark"
              class="re-input"
              #locationCtrl="ngModel"
            />
            <p *ngIf="locationCtrl.invalid && locationCtrl.touched" class="mt-1 text-xs text-re-danger">
              <span *ngIf="locationCtrl.errors?.['required']">Location is required.</span>
              <span *ngIf="locationCtrl.errors?.['minlength']">Use at least 3 characters.</span>
              <span *ngIf="locationCtrl.errors?.['maxlength']">Location is too long.</span>
              <span *ngIf="locationCtrl.errors?.['pattern']">Enter a real address or landmark (not only spaces).</span>
            </p>
          </div>

          <div>
            <label class="re-eyebrow mb-1.5 block text-re-subtle" for="checkout-delivery-date">Delivery date</label>
            <input
              id="checkout-delivery-date"
              [(ngModel)]="deliveryDate"
              name="deliveryDate"
              type="date"
              required
              [min]="minDateStr"
              class="re-input"
              #deliveryCtrl="ngModel"
            />
            <p *ngIf="deliveryCtrl.invalid && deliveryCtrl.touched" class="mt-1 text-xs text-re-danger">
              <span *ngIf="deliveryCtrl.errors?.['required']">Choose a delivery date.</span>
            </p>
          </div>

          <div>
            <label class="re-eyebrow mb-1.5 block text-re-subtle" for="checkout-pickup-date">Planned pickup (optional)</label>
            <input
              id="checkout-pickup-date"
              [(ngModel)]="pickupDate"
              name="pickupDate"
              type="date"
              [min]="pickupMinDate()"
              class="re-input"
            />
          </div>

          <div class="rounded-2xl border border-re-border bg-re-accent-soft/50 p-4">
            <p class="re-eyebrow text-re-subtle">Order total</p>
            <p class="font-serif mt-1 text-2xl font-semibold text-re-ink">{{ total() | inr }}</p>
          </div>

          <button type="submit" class="re-btn-primary w-full">Confirm order</button>
          <p *ngIf="message()" class="text-sm font-medium text-re-success">{{ message() }}</p>
        </form>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly areaService = inject(ServiceAreaService);
  private readonly router = inject(Router);

  protected readonly activeAreas = computed(() => this.areaService.areas().filter((area) => area.active));
  protected readonly minDateStr = CheckoutComponent.isoTodayLocal();
  protected serviceAreaId = '';
  protected deliveryLocation = '';
  protected deliveryDate = '';
  protected pickupDate = '';
  protected readonly message = signal('');
  protected readonly checkoutError = signal('');
  protected readonly total = computed(() => {
    const items = this.cartService.cartItems();
    const products = this.productService.products();
    return items.reduce((sum, item) => {
      const product = products.find((productItem) => productItem.id === item.productId);
      return product ? sum + product.pricePerMonth * item.tenure * item.quantity : sum;
    }, 0);
  });

  protected pickupMinDate(): string {
    return this.deliveryDate || this.minDateStr;
  }

  protected confirm(form: NgForm): void {
    this.checkoutError.set('');
    this.message.set('');
    form.control.markAllAsTouched();
    if (form.invalid) {
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.cartService.cartItems().length) {
      this.checkoutError.set('Your cart is empty.');
      return;
    }

    const vendorId = this.authService.getDefaultVendorId();
    if (!vendorId) {
      this.checkoutError.set('Vendor is not available for this demo.');
      return;
    }

    const location = this.deliveryLocation.trim();
    if (location.length < 3) {
      this.checkoutError.set('Enter a clearer delivery location (at least 3 characters).');
      return;
    }

    const delivery = CheckoutComponent.parseYmdLocal(this.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (delivery < today) {
      this.checkoutError.set('Delivery date cannot be in the past.');
      return;
    }

    if (this.pickupDate) {
      const pickup = CheckoutComponent.parseYmdLocal(this.pickupDate);
      if (pickup < delivery) {
        this.checkoutError.set('Pickup cannot be before the delivery date.');
        return;
      }
    }

    this.orderService
      .createOrder({
        userId: user.id,
        vendorId,
        items: this.cartService.cartItems(),
        totalAmount: this.total(),
        deliveryDate: this.deliveryDate,
        pickupDate: this.pickupDate || undefined,
        serviceAreaId: this.serviceAreaId,
        deliveryLocation: location,
      })
      .subscribe(() => {
        this.cartService.clearCart();
        this.message.set('Order placed successfully.');
        this.router.navigateByUrl('/dashboard');
      });
  }

  constructor() {
    const first = this.activeAreas()[0]?.id;
    this.serviceAreaId = first ?? '';
  }

  private static isoTodayLocal(): string {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  }

  private static parseYmdLocal(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map((v) => Number(v));
    return new Date(y, m - 1, d);
  }
}
