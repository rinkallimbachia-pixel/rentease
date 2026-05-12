import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { ClaimService } from '../claims/claim.service';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { ProductService } from '../products/product.service';
import { OrderService } from './order.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, InrPipe, RouterLink],
  template: `
    <section class="fade-in space-y-6">
      <header class="re-panel-lg p-6 sm:p-8">
        <p class="re-eyebrow text-re-subtle">Account</p>
        <h1 class="re-display mt-2 text-3xl">My rentals</h1>
        <p class="mt-2 text-sm text-re-muted">Active and past orders. Extend tenure or open a maintenance ticket anytime.</p>
      </header>

      <article
        *ngFor="let order of userOrders(); trackBy: trackById"
        class="re-panel space-y-4 p-5 sm:p-6"
      >
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-mono text-sm font-semibold text-re-ink">#{{ order.id.slice(0, 8) }}</p>
            <p class="mt-0.5 text-xs text-re-muted">Delivery {{ order.deliveryDate }}</p>
            <p class="mt-0.5 text-xs text-re-muted">Pickup {{ order.pickupDate || 'Not scheduled yet' }}</p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold capitalize"
            [class.bg-re-success-soft]="order.status === 'active'"
            [class.text-re-success]="order.status === 'active'"
            [class.bg-re-canvas]="order.status === 'completed'"
            [class.text-re-muted]="order.status === 'completed'"
            [class.bg-re-danger-soft]="order.status === 'cancelled'"
            [class.text-re-danger]="order.status === 'cancelled'"
          >
            {{ order.status }}
          </span>
        </header>
        <ul class="space-y-2 border-t border-re-border pt-4 text-sm text-re-muted">
          <li *ngFor="let item of order.items" class="flex justify-between gap-2">
            <span class="text-re-ink">{{ getProductName(item.productId) }}</span>
            <span>{{ item.tenure }} mo × {{ item.quantity }}</span>
          </li>
        </ul>
        <p class="text-lg font-bold text-re-ink">Total {{ order.totalAmount | inr }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            (click)="extend(order.id, order.items[0]?.productId)"
            class="re-btn-secondary !py-2 !text-sm"
          >
            Extend +3 months
          </button>
          <button
            type="button"
            (click)="maintenance(order.id)"
            class="rounded-full border border-re-border bg-re-canvas px-4 py-2 text-sm font-semibold text-re-ink hover:bg-re-border/40"
          >
            Request maintenance
          </button>
          <button
            type="button"
            (click)="raiseClaim(order.id, 'damage')"
            class="rounded-full border border-re-danger/30 px-4 py-2 text-sm font-semibold text-re-danger hover:bg-re-danger-soft"
          >
            Raise damage claim
          </button>
          <button
            type="button"
            (click)="raiseClaim(order.id, 'dispute')"
            class="rounded-full border border-re-accent/30 px-4 py-2 text-sm font-semibold text-re-accent hover:bg-re-accent-soft"
          >
            Raise dispute
          </button>
        </div>
      </article>

      <p *ngIf="!userOrders().length" class="re-panel border-dashed p-10 text-center text-sm text-re-muted">
        No rentals yet. <a routerLink="/products" class="font-semibold text-re-accent hover:underline">Explore catalog</a>
      </p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly claimService = inject(ClaimService);

  protected readonly userOrders = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return [];
    }
    return this.orderService.orders().filter((order) => order.userId === user.id);
  });

  protected getProductName(productId: string): string {
    return this.productService.products().find((product) => product.id === productId)?.name ?? 'Unknown item';
  }

  protected extend(orderId: string, productId?: string): void {
    if (!productId) {
      return;
    }
    this.orderService.extendRental(orderId, productId, 3).subscribe();
  }

  protected maintenance(orderId: string): void {
    this.maintenanceService.createRequest(orderId, 'General maintenance request').subscribe();
  }

  protected raiseClaim(orderId: string, type: 'damage' | 'dispute'): void {
    const user = this.authService.currentUser();
    if (!user) {
      return;
    }
    this.claimService.createClaim({ orderId, userId: user.id, type, description: `${type} raised by customer` }).subscribe();
  }

  protected trackById = (_: number, order: { id: string }) => order.id;
}
