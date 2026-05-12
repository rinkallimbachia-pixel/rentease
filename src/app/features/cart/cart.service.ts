import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';

import { CartItem } from '../../shared/models/entities';
import { StorageService } from '../../core/storage.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly key = 'rentease_cart';
  private readonly cartSubject: BehaviorSubject<CartItem[]>;
  readonly cart$;
  readonly cartItems = signal<CartItem[]>([]);
  readonly totalItems = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));

  constructor(private readonly storage: StorageService) {
    const cart = this.storage.getItem<CartItem[]>(this.key, []);
    this.cartSubject = new BehaviorSubject<CartItem[]>(cart);
    this.cart$ = this.cartSubject.asObservable();
    this.cartItems.set(cart);
  }

  addToCart(item: CartItem): Observable<void> {
    const existing = this.cartSubject.value.find((cartItem) => cartItem.productId === item.productId);
    const next = existing
      ? this.cartSubject.value.map((cartItem) =>
          cartItem.productId === item.productId ? { ...cartItem, quantity: cartItem.quantity + item.quantity, tenure: item.tenure } : cartItem,
        )
      : [...this.cartSubject.value, item];

    this.persist(next);
    return of(void 0).pipe(delay(200));
  }

  updateItem(productId: string, patch: Partial<CartItem>): Observable<void> {
    this.persist(this.cartSubject.value.map((item) => (item.productId === productId ? { ...item, ...patch } : item)));
    return of(void 0).pipe(delay(200));
  }

  removeItem(productId: string): Observable<void> {
    this.persist(this.cartSubject.value.filter((item) => item.productId !== productId));
    return of(void 0).pipe(delay(180));
  }

  clearCart(): void {
    this.persist([]);
  }

  private persist(cart: CartItem[]): void {
    this.cartSubject.next(cart);
    this.cartItems.set(cart);
    this.storage.setItem(this.key, cart);
  }
}
