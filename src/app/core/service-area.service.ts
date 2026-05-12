import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';

import { ServiceArea } from '../shared/models/entities';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ServiceAreaService {
  private readonly key = 'rentease_service_areas';
  private readonly areasSubject: BehaviorSubject<ServiceArea[]>;
  readonly areas$;
  readonly areas = signal<ServiceArea[]>([]);

  constructor(private readonly storage: StorageService) {
    const seeded = this.storage.getItem<ServiceArea[]>(this.key, []);
    const areas = seeded.length ? seeded : this.getSeedAreas();
    this.areasSubject = new BehaviorSubject<ServiceArea[]>(areas);
    this.areas$ = this.areasSubject.asObservable();
    this.areas.set(areas);
    this.storage.setItem(this.key, areas);
  }

  addArea(payload: Omit<ServiceArea, 'id'>): Observable<ServiceArea> {
    const area: ServiceArea = { id: crypto.randomUUID(), ...payload };
    this.persist([...this.areasSubject.value, area]);
    return of(area).pipe(delay(220));
  }

  updateArea(area: ServiceArea): Observable<void> {
    this.persist(this.areasSubject.value.map((item) => (item.id === area.id ? area : item)));
    return of(void 0).pipe(delay(200));
  }

  removeArea(id: string): Observable<void> {
    this.persist(this.areasSubject.value.filter((item) => item.id !== id));
    return of(void 0).pipe(delay(200));
  }

  private persist(areas: ServiceArea[]): void {
    this.areasSubject.next(areas);
    this.areas.set(areas);
    this.storage.setItem(this.key, areas);
  }

  private getSeedAreas(): ServiceArea[] {
    return [
      { id: crypto.randomUUID(), city: 'Mumbai', zone: 'Andheri East', active: true },
      { id: crypto.randomUUID(), city: 'Pune', zone: 'Hinjewadi', active: true },
      { id: crypto.randomUUID(), city: 'Bengaluru', zone: 'Whitefield', active: true },
    ];
  }
}
