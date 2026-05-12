import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of } from 'rxjs';

import { MaintenanceRequest, MaintenanceStatus } from '../../shared/models/entities';
import { StorageService } from '../../core/storage.service';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly key = 'rentease_maintenance';
  private readonly maintenanceSubject: BehaviorSubject<MaintenanceRequest[]>;
  readonly requests$;
  readonly requests = signal<MaintenanceRequest[]>([]);

  constructor(private readonly storage: StorageService) {
    const requests = this.storage.getItem<MaintenanceRequest[]>(this.key, []);
    this.maintenanceSubject = new BehaviorSubject<MaintenanceRequest[]>(requests);
    this.requests$ = this.maintenanceSubject.asObservable();
    this.requests.set(requests);
  }

  createRequest(orderId: string, issue: string): Observable<MaintenanceRequest> {
    const request: MaintenanceRequest = { id: crypto.randomUUID(), orderId, issue, status: 'open', createdAt: new Date().toISOString() };
    this.persist([...this.maintenanceSubject.value, request]);
    return of(request).pipe(delay(300));
  }

  getByOrder(orderId: string): Observable<MaintenanceRequest[]> {
    return this.requests$.pipe(map((items) => items.filter((item) => item.orderId === orderId)), delay(200));
  }

  updateStatus(id: string, status: MaintenanceStatus): Observable<void> {
    this.persist(
      this.maintenanceSubject.value.map((item) =>
        item.id === id ? { ...item, status, resolvedAt: status === 'resolved' ? new Date().toISOString() : item.resolvedAt } : item,
      ),
    );
    return of(void 0).pipe(delay(220));
  }

  private persist(requests: MaintenanceRequest[]): void {
    this.maintenanceSubject.next(requests);
    this.requests.set(requests);
    this.storage.setItem(this.key, requests);
  }
}
