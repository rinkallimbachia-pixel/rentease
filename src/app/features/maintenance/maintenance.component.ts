import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { MaintenanceService } from './maintenance.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <section class="fade-in space-y-6">
      <header class="re-panel-lg p-6 sm:p-8">
        <p class="re-eyebrow text-re-subtle">Support</p>
        <h1 class="re-display mt-2 text-3xl">Maintenance requests</h1>
        <p class="mt-2 text-sm text-re-muted">Track ticket status and linked orders. Updates sync to the admin queue.</p>
      </header>

      <article *ngFor="let request of requests(); trackBy: trackById" class="re-panel p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-mono text-sm font-semibold text-re-ink">#{{ request.id.slice(0, 8) }}</p>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold capitalize"
            [class.bg-re-accent-soft]="request.status === 'open'"
            [class.text-re-accent]="request.status === 'open'"
            [class.bg-re-canvas]="request.status === 'in-progress'"
            [class.text-re-muted]="request.status === 'in-progress'"
            [class.bg-re-success-soft]="request.status === 'resolved'"
            [class.text-re-success]="request.status === 'resolved'"
          >
            {{ request.status }}
          </span>
        </div>
        <p class="mt-2 text-xs text-re-muted">Order #{{ request.orderId.slice(0, 8) }}</p>
        <p class="mt-3 text-sm leading-relaxed text-re-ink">{{ request.issue }}</p>
      </article>

      <p *ngIf="!requests().length" class="re-panel border-dashed p-10 text-center text-sm text-re-muted">
        No requests yet. Open one from <strong class="text-re-ink">My rentals</strong> after placing an order.
      </p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceComponent {
  private readonly maintenanceService = inject(MaintenanceService);
  protected readonly requests = computed(() => this.maintenanceService.requests());
  protected trackById = (_: number, request: { id: string }) => request.id;
}
