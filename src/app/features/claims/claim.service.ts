import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';

import { ClaimStatus, ClaimType, DisputeClaim } from '../../shared/models/entities';
import { StorageService } from '../../core/storage.service';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private readonly key = 'rentease_claims';
  private readonly claimsSubject: BehaviorSubject<DisputeClaim[]>;
  readonly claims$;
  readonly claims = signal<DisputeClaim[]>([]);

  constructor(private readonly storage: StorageService) {
    const claims = this.storage.getItem<DisputeClaim[]>(this.key, []);
    this.claimsSubject = new BehaviorSubject<DisputeClaim[]>(claims);
    this.claims$ = this.claimsSubject.asObservable();
    this.claims.set(claims);
  }

  createClaim(payload: { orderId: string; userId: string; type: ClaimType; description: string }): Observable<DisputeClaim> {
    const claim: DisputeClaim = {
      id: crypto.randomUUID(),
      status: 'open',
      createdAt: new Date().toISOString(),
      ...payload,
    };
    this.persist([...this.claimsSubject.value, claim]);
    return of(claim).pipe(delay(250));
  }

  updateStatus(id: string, status: ClaimStatus): Observable<void> {
    this.persist(this.claimsSubject.value.map((item) => (item.id === id ? { ...item, status } : item)));
    return of(void 0).pipe(delay(220));
  }

  private persist(claims: DisputeClaim[]): void {
    this.claimsSubject.next(claims);
    this.claims.set(claims);
    this.storage.setItem(this.key, claims);
  }
}
