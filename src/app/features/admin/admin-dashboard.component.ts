import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { ServiceAreaService } from '../../core/service-area.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { ClaimStatus, MaintenanceStatus, OrderStatus, Product, ServiceArea } from '../../shared/models/entities';
import { ClaimService } from '../claims/claim.service';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { OrderService } from '../orders/order.service';
import { ProductService } from '../products/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, InrPipe],
  template: `
    <section class="fade-in space-y-8">
      <header class="re-panel-lg p-6 sm:p-8">
        <p class="re-eyebrow text-re-subtle">Operations</p>
        <h1 class="re-display mt-2 text-3xl sm:text-[2.125rem]">Admin dashboard</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-re-muted">
          Inventory, rentals, vendor fulfillment, disputes, and service areas in one place.
        </p>
      </header>

      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article class="re-panel p-5"><p class="text-xs text-re-subtle">Active rentals</p><p class="mt-2 text-3xl font-bold">{{ activeOrders() }}</p></article>
        <article class="re-panel p-5"><p class="text-xs text-re-subtle">MRR</p><p class="mt-2 text-3xl font-bold">{{ mrr() | inr }}</p></article>
        <article class="re-panel p-5"><p class="text-xs text-re-subtle">Utilization</p><p class="mt-2 text-3xl font-bold">{{ utilizationRate() }}%</p></article>
        <article class="re-panel p-5"><p class="text-xs text-re-subtle">Retention</p><p class="mt-2 text-3xl font-bold">{{ retentionRate() }}%</p></article>
        <article class="re-panel p-5"><p class="text-xs text-re-subtle">Avg resolution</p><p class="mt-2 text-3xl font-bold">{{ avgResolutionHours() }}h</p></article>
      </section>

      <article class="re-panel-lg p-6 sm:p-8">
        <h2 class="re-display text-lg">Product management</h2>
        <form #productForm="ngForm" class="mt-6 grid gap-3 lg:grid-cols-6 lg:items-start" (ngSubmit)="saveProduct(productForm)">
          <div class="grid gap-1 self-start lg:col-span-2">
            <input
              [(ngModel)]="draft.name"
              name="productName"
              placeholder="Name"
              required
              minlength="2"
              maxlength="120"
              pattern=".*\\S.*"
              class="re-input"
              #pName="ngModel"
            />
            <p *ngIf="pName.invalid && pName.touched" class="text-xs text-re-danger">
              <span *ngIf="pName.errors?.['required']">Name is required.</span>
              <span *ngIf="pName.errors?.['minlength']">At least 2 characters.</span>
              <span *ngIf="pName.errors?.['pattern']">Cannot be only spaces.</span>
            </p>
          </div>
          <div class="self-start lg:col-span-1">
            <select [(ngModel)]="draft.category" name="productCategory" required class="re-input">
              <option value="Furniture">Furniture</option>
              <option value="Appliance">Appliance</option>
            </select>
          </div>
          <div class="grid gap-1 self-start">
            <input
              [(ngModel)]="draft.pricePerMonth"
              name="pricePerMonth"
              type="number"
              placeholder="Rent / mo"
              required
              min="1"
              max="9999999"
              step="1"
              class="re-input"
              #pPrice="ngModel"
            />
            <p *ngIf="pPrice.invalid && pPrice.touched" class="text-xs text-re-danger">
              <span *ngIf="pPrice.errors?.['required']">Required.</span>
              <span *ngIf="pPrice.errors?.['min']">Minimum ₹1 / month.</span>
            </p>
          </div>
          <div class="grid gap-1 self-start">
            <input
              [(ngModel)]="draft.deposit"
              name="productDeposit"
              type="number"
              placeholder="Deposit"
              required
              min="0"
              max="99999999"
              step="1"
              class="re-input"
              #pDeposit="ngModel"
            />
            <p *ngIf="pDeposit.invalid && pDeposit.touched" class="text-xs text-re-danger">
              <span *ngIf="pDeposit.errors?.['required']">Required.</span>
              <span *ngIf="pDeposit.errors?.['min']">Deposit cannot be negative.</span>
            </p>
          </div>
          <button type="submit" class="re-btn-primary self-end lg:col-span-1">{{ editingId ? 'Update' : 'Add' }}</button>
        </form>
        <div class="mt-6 divide-y divide-re-border rounded-2xl border border-re-border bg-re-canvas/50">
          <div *ngFor="let product of products(); trackBy: trackById" class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p class="text-sm font-semibold text-re-ink">{{ product.name }} · {{ product.pricePerMonth | inr }}/mo</p>
            <div class="flex gap-2">
              <button type="button" (click)="editProduct(product)" class="re-btn-secondary !px-3 !py-2 !text-xs">Edit</button>
              <button type="button" (click)="toggle(product.id)" class="re-btn-secondary !px-3 !py-2 !text-xs">{{ product.available ? 'Disable' : 'Enable' }}</button>
              <button type="button" (click)="remove(product.id)" class="rounded-xl border border-re-danger/30 px-3 py-2 text-xs font-semibold text-re-danger hover:bg-re-danger-soft">Delete</button>
            </div>
          </div>
        </div>
      </article>

      <article class="re-panel-lg p-6 sm:p-8">
        <h2 class="re-display text-lg">Service area management</h2>
        <form #areaForm="ngForm" class="mt-4 grid gap-3 md:grid-cols-4 md:items-start" (ngSubmit)="saveArea(areaForm)">
          <div class="grid gap-1 self-start">
            <input
              [(ngModel)]="areaDraft.city"
              name="areaCity"
              placeholder="City"
              required
              minlength="2"
              maxlength="80"
              pattern=".*\\S.*"
              class="re-input"
              #cityCtrl="ngModel"
            />
            <p *ngIf="cityCtrl.invalid && cityCtrl.touched" class="text-xs text-re-danger">Enter a valid city (2+ characters).</p>
          </div>
          <div class="grid gap-1 self-start">
            <input
              [(ngModel)]="areaDraft.zone"
              name="areaZone"
              placeholder="Zone"
              required
              minlength="2"
              maxlength="80"
              pattern=".*\\S.*"
              class="re-input"
              #zoneCtrl="ngModel"
            />
            <p *ngIf="zoneCtrl.invalid && zoneCtrl.touched" class="text-xs text-re-danger">Enter a valid zone (2+ characters).</p>
          </div>
          <div class="self-start">
            <select [(ngModel)]="areaDraft.active" name="areaActive" required class="re-input">
              <option [ngValue]="true">Active</option>
              <option [ngValue]="false">Inactive</option>
            </select>
          </div>
          <button type="submit" class="re-btn-primary self-end">{{ editingAreaId ? 'Update area' : 'Add area' }}</button>
        </form>
        <div class="mt-4 space-y-2">
          <div *ngFor="let area of areas(); trackBy: trackByAreaId" class="flex items-center justify-between rounded-2xl border border-re-border bg-re-surface px-4 py-3">
            <p class="text-sm font-semibold text-re-ink">{{ area.city }} - {{ area.zone }}</p>
            <div class="flex gap-2">
              <span class="rounded-full px-2 py-1 text-xs" [class.bg-re-success-soft]="area.active" [class.text-re-success]="area.active" [class.bg-re-danger-soft]="!area.active" [class.text-re-danger]="!area.active">
                {{ area.active ? 'active' : 'inactive' }}
              </span>
              <button type="button" (click)="editArea(area)" class="re-btn-secondary !px-3 !py-1.5 !text-xs">Edit</button>
              <button type="button" (click)="removeArea(area.id)" class="rounded-xl border border-re-danger/30 px-3 py-1.5 text-xs font-semibold text-re-danger">Delete</button>
            </div>
          </div>
        </div>
      </article>

      <article class="re-panel-lg p-6 sm:p-8">
        <h2 class="re-display text-lg">Order &amp; vendor tracking</h2>
        <div class="mt-4 space-y-2">
          <div *ngFor="let order of orders(); trackBy: trackByOrder" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-re-border bg-re-surface px-4 py-3">
            <p class="text-sm font-semibold text-re-ink">#{{ order.id.slice(0, 8) }} · {{ order.totalAmount | inr }} · Pickup: {{ order.pickupDate || 'pending' }}</p>
            <select [ngModel]="order.status" (ngModelChange)="updateOrder(order.id, $event)" class="re-input !w-auto !min-w-[10rem] !py-2 !text-sm">
              <option value="active">active</option><option value="completed">completed</option><option value="cancelled">cancelled</option>
            </select>
          </div>
        </div>
      </article>

      <article class="re-panel-lg p-6 sm:p-8">
        <h2 class="re-display text-lg">Dispute &amp; damage claims</h2>
        <div class="mt-4 space-y-2">
          <div *ngFor="let claim of claims(); trackBy: trackByClaim" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-re-border bg-re-surface px-4 py-3">
            <p class="text-sm text-re-ink">#{{ claim.orderId.slice(0, 6) }} · {{ claim.type }} · {{ claim.description }}</p>
            <select [ngModel]="claim.status" (ngModelChange)="updateClaim(claim.id, $event)" class="re-input !w-auto !min-w-[10rem] !py-2 !text-sm">
              <option value="open">open</option><option value="reviewing">reviewing</option><option value="resolved">resolved</option><option value="rejected">rejected</option>
            </select>
          </div>
        </div>
      </article>

      <article class="re-panel-lg p-6 sm:p-8">
        <h2 class="re-display text-lg">Maintenance queue</h2>
        <div class="mt-4 space-y-2">
          <div *ngFor="let request of maintenance(); trackBy: trackByRequest" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-re-border bg-re-surface px-4 py-3">
            <p class="max-w-md text-sm text-re-muted">{{ request.issue }}</p>
            <select [ngModel]="request.status" (ngModelChange)="updateMaintenance(request.id, $event)" class="re-input !w-auto !min-w-[10rem] !py-2 !text-sm">
              <option value="open">open</option><option value="in-progress">in-progress</option><option value="resolved">resolved</option>
            </select>
          </div>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly areaService = inject(ServiceAreaService);
  private readonly claimService = inject(ClaimService);

  protected readonly products = computed(() => this.productService.products());
  protected readonly orders = computed(() => this.orderService.orders());
  protected readonly maintenance = computed(() => this.maintenanceService.requests());
  protected readonly areas = computed(() => this.areaService.areas());
  protected readonly claims = computed(() => this.claimService.claims());
  protected readonly activeOrders = computed(() => this.orders().filter((order) => order.status === 'active').length);
  protected readonly mrr = computed(() => this.orders().filter((order) => order.status === 'active').reduce((sum, order) => sum + order.totalAmount, 0));
  protected readonly utilizationRate = computed(() => {
    const total = this.products().length;
    if (!total) return 0;
    const unavailable = this.products().filter((product) => !product.available).length;
    return Math.round((unavailable / total) * 100);
  });
  protected readonly retentionRate = computed(() => {
    const all = this.orders().length;
    if (!all) return 0;
    const retained = this.orders().filter((order) => order.status !== 'cancelled').length;
    return Math.round((retained / all) * 100);
  });
  protected readonly avgResolutionHours = computed(() => {
    const resolved = this.maintenance().filter((item) => item.resolvedAt && item.createdAt);
    if (!resolved.length) return 0;
    const totalHours = resolved.reduce((sum, item) => sum + (new Date(item.resolvedAt!).getTime() - new Date(item.createdAt).getTime()) / 36e5, 0);
    return Math.round(totalHours / resolved.length);
  });

  protected editingId: string | null = null;
  protected editingAreaId: string | null = null;
  protected draft: Omit<Product, 'id'> = this.emptyDraft();
  protected areaDraft: Omit<ServiceArea, 'id'> = { city: '', zone: '', active: true };

  protected saveProduct(form: NgForm): void {
    form.control.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    const price = Number(this.draft.pricePerMonth);
    const deposit = Number(this.draft.deposit);
    if (!Number.isFinite(price) || price < 1 || !Number.isFinite(deposit) || deposit < 0) {
      return;
    }
    const payload: Omit<Product, 'id'> = {
      ...this.draft,
      name: this.draft.name.trim(),
      pricePerMonth: Math.trunc(price),
      deposit: Math.trunc(deposit),
    };
    if (this.editingId) {
      this.productService.updateProduct({ id: this.editingId, ...payload }).subscribe();
    } else {
      this.productService.addProduct(payload).subscribe();
    }
    this.editingId = null;
    this.draft = this.emptyDraft();
    queueMicrotask(() => {
      form.control.markAsUntouched();
      form.control.markAsPristine();
    });
  }

  protected editProduct(product: Product): void {
    this.editingId = product.id;
    this.draft = { ...product, tenureOptions: [...product.tenureOptions] };
  }

  protected saveArea(form: NgForm): void {
    form.control.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    const city = this.areaDraft.city.trim();
    const zone = this.areaDraft.zone.trim();
    if (city.length < 2 || zone.length < 2) {
      return;
    }
    const payload = { city, zone, active: this.areaDraft.active };
    if (this.editingAreaId) {
      this.areaService.updateArea({ id: this.editingAreaId, ...payload }).subscribe();
    } else {
      this.areaService.addArea(payload).subscribe();
    }
    this.editingAreaId = null;
    this.areaDraft = { city: '', zone: '', active: true };
    queueMicrotask(() => {
      form.control.markAsUntouched();
      form.control.markAsPristine();
    });
  }

  protected editArea(area: ServiceArea): void {
    this.editingAreaId = area.id;
    this.areaDraft = { city: area.city, zone: area.zone, active: area.active };
  }

  protected removeArea(id: string): void {
    this.areaService.removeArea(id).subscribe();
  }

  protected remove(id: string): void {
    this.productService.deleteProduct(id).subscribe();
  }

  protected toggle(id: string): void {
    this.productService.toggleAvailability(id).subscribe();
  }

  protected updateOrder(orderId: string, status: OrderStatus): void {
    this.orderService.updateStatus(orderId, status).subscribe();
  }

  protected updateClaim(id: string, status: ClaimStatus): void {
    this.claimService.updateStatus(id, status).subscribe();
  }

  protected updateMaintenance(id: string, status: MaintenanceStatus): void {
    this.maintenanceService.updateStatus(id, status).subscribe();
  }

  protected trackById = (_: number, product: { id: string }) => product.id;
  protected trackByOrder = (_: number, order: { id: string }) => order.id;
  protected trackByRequest = (_: number, request: { id: string }) => request.id;
  protected trackByAreaId = (_: number, area: { id: string }) => area.id;
  protected trackByClaim = (_: number, claim: { id: string }) => claim.id;

  private emptyDraft(): Omit<Product, 'id'> {
    return {
      name: '',
      category: 'Furniture',
      pricePerMonth: 500,
      deposit: 2500,
      tenureOptions: [3, 6, 12],
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      available: true,
    };
  }
}
