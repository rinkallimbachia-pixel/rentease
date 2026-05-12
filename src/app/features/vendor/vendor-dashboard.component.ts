import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/auth.service';
import { ServiceAreaService } from '../../core/service-area.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { OrderService } from '../orders/order.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, InrPipe],
  template: `
    <section class="fade-in space-y-6">
      <header class="re-panel-lg p-6 sm:p-8">
        <p class="re-eyebrow text-re-subtle">Vendor</p>
        <h1 class="re-display mt-2 text-3xl">Delivery &amp; pickup</h1>
        <p class="mt-2 text-sm text-re-muted">Manage assigned orders, update pickup schedules, and track fulfilment status.</p>
      </header>

      <article *ngFor="let order of assignedOrders(); trackBy: trackById" class="re-panel space-y-4 p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-mono text-sm font-semibold text-re-ink">#{{ order.id.slice(0, 8) }}</p>
          <span class="rounded-full bg-re-accent-soft px-3 py-1 text-xs font-semibold text-re-accent">{{ order.status }}</span>
        </div>
        <p class="text-sm text-re-muted">
          Service area: {{ getAreaName(order.serviceAreaId) }} · {{ order.deliveryLocation }}
        </p>
        <p class="text-sm text-re-muted">Delivery: {{ order.deliveryDate }} · Pickup: {{ order.pickupDate || 'Not scheduled' }}</p>
        <p class="text-sm font-semibold text-re-ink">Order value {{ order.totalAmount | inr }}</p>
        <div class="flex flex-wrap items-center gap-2">
          <input
            type="date"
            [ngModel]="order.pickupDate || ''"
            (ngModelChange)="schedulePickup(order.id, $event, order.deliveryDate)"
            [min]="pickupMinDate(order.deliveryDate)"
            [name]="'pickup_' + order.id"
            class="re-input !w-auto !py-2"
            [class.border-re-danger]="pickupErrorOrderId() === order.id"
          />
          <button type="button" (click)="complete(order.id)" class="re-btn-secondary !py-2">Mark completed</button>
        </div>
        <p *ngIf="pickupErrorOrderId() === order.id && pickupErrorMessage()" class="text-xs font-medium text-re-danger">
          {{ pickupErrorMessage() }}
        </p>
        <p
          *ngIf="completeFeedbackOrderId() === order.id && completeFeedbackMessage()"
          class="text-xs font-medium"
          [class.text-re-success]="completeFeedbackOk()"
          [class.text-re-danger]="!completeFeedbackOk()"
        >
          {{ completeFeedbackMessage() }}
        </p>
      </article>

      <p *ngIf="!assignedOrders().length" class="re-panel border-dashed p-10 text-center text-sm text-re-muted">
        No orders assigned to this vendor.
      </p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorDashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly areaService = inject(ServiceAreaService);

  protected readonly pickupErrorMessage = signal('');
  protected readonly pickupErrorOrderId = signal<string | null>(null);
  protected readonly completeFeedbackMessage = signal('');
  protected readonly completeFeedbackOrderId = signal<string | null>(null);
  protected readonly completeFeedbackOk = signal(true);

  protected readonly assignedOrders = computed(() => {
    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      return [];
    }
    return this.orderService.orders().filter((order) => order.vendorId === userId);
  });

  protected pickupMinDate(deliveryDate: string): string {
    const today = VendorDashboardComponent.isoTodayLocal();
    return deliveryDate && deliveryDate > today ? deliveryDate : today;
  }

  protected schedulePickup(orderId: string, date: string, deliveryDate: string): void {
    this.completeFeedbackOrderId.set(null);
    this.completeFeedbackMessage.set('');
    this.completeFeedbackOk.set(true);

    if (!date) {
      this.clearPickupErrorIf(orderId);
      return;
    }

    const pickup = VendorDashboardComponent.parseYmdLocal(date);
    const delivery = VendorDashboardComponent.parseYmdLocal(deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(pickup.getTime()) || Number.isNaN(delivery.getTime())) {
      this.pickupErrorOrderId.set(orderId);
      this.pickupErrorMessage.set('Invalid date on this order. Contact support.');
      return;
    }

    if (pickup < today) {
      this.pickupErrorOrderId.set(orderId);
      this.pickupErrorMessage.set('Pickup cannot be before today.');
      return;
    }
    if (pickup < delivery) {
      this.pickupErrorOrderId.set(orderId);
      this.pickupErrorMessage.set('Pickup must be on or after the delivery date.');
      return;
    }

    this.pickupErrorOrderId.set(null);
    this.pickupErrorMessage.set('');
    this.orderService.schedulePickup(orderId, date).subscribe({
      error: () => {
        this.pickupErrorOrderId.set(orderId);
        this.pickupErrorMessage.set('Could not save pickup. Try again.');
      },
    });
  }

  private clearPickupErrorIf(orderId: string): void {
    if (this.pickupErrorOrderId() === orderId) {
      this.pickupErrorOrderId.set(null);
      this.pickupErrorMessage.set('');
    }
  }

  private static isoTodayLocal(): string {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  }

  private static parseYmdLocal(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map((v) => Number(v));
    return new Date(y, m - 1, d);
  }

  protected complete(orderId: string): void {
    this.pickupErrorOrderId.set(null);
    this.pickupErrorMessage.set('');
    this.orderService.updateStatus(orderId, 'completed').subscribe({
      next: () => {
        this.completeFeedbackOk.set(true);
        this.completeFeedbackOrderId.set(orderId);
        this.completeFeedbackMessage.set('Order marked completed.');
      },
      error: () => {
        this.completeFeedbackOk.set(false);
        this.completeFeedbackOrderId.set(orderId);
        this.completeFeedbackMessage.set('Could not update status. Try again.');
      },
    });
  }

  protected getAreaName(serviceAreaId: string): string {
    const area = this.areaService.areas().find((item) => item.id === serviceAreaId);
    return area ? `${area.city} - ${area.zone}` : 'Unknown area';
  }

  protected trackById = (_: number, order: { id: string }) => order.id;
}
