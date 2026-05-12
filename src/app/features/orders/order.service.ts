import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of } from 'rxjs';

import { CartItem, Order, OrderStatus } from '../../shared/models/entities';
import { StorageService } from '../../core/storage.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly key = 'rentease_orders';
  private readonly ordersSubject: BehaviorSubject<Order[]>;
  readonly orders$;
  readonly orders = signal<Order[]>([]);

  constructor(private readonly storage: StorageService) {
    const orders = this.storage.getItem<Order[]>(this.key, []);
    this.ordersSubject = new BehaviorSubject<Order[]>(orders);
    this.orders$ = this.ordersSubject.asObservable();
    this.orders.set(orders);
  }

  createOrder(payload: {
    userId: string;
    vendorId: string;
    items: CartItem[];
    totalAmount: number;
    deliveryDate: string;
    pickupDate?: string;
    serviceAreaId: string;
    deliveryLocation: string;
  }): Observable<Order> {
    const order: Order = { id: crypto.randomUUID(), status: 'active', ...payload };
    this.persist([...this.ordersSubject.value, order]);
    return of(order).pipe(delay(450));
  }

  getOrdersByUser(userId: string): Observable<Order[]> {
    return this.orders$.pipe(map((orders) => orders.filter((order) => order.userId === userId)), delay(250));
  }

  updateStatus(orderId: string, status: OrderStatus): Observable<void> {
    this.persist(this.ordersSubject.value.map((item) => (item.id === orderId ? { ...item, status } : item)));
    return of(void 0).pipe(delay(250));
  }

  extendRental(orderId: string, productId: string, extraMonths: number): Observable<void> {
    this.persist(this.ordersSubject.value.map((order) =>
      order.id === orderId
        ? { ...order, items: order.items.map((item) => (item.productId === productId ? { ...item, tenure: item.tenure + extraMonths } : item)) }
        : order,
    ));
    return of(void 0).pipe(delay(280));
  }

  getOrdersByVendor(vendorId: string): Observable<Order[]> {
    return this.orders$.pipe(map((orders) => orders.filter((order) => order.vendorId === vendorId)), delay(250));
  }

  schedulePickup(orderId: string, pickupDate: string): Observable<void> {
    this.persist(this.ordersSubject.value.map((order) => (order.id === orderId ? { ...order, pickupDate } : order)));
    return of(void 0).pipe(delay(220));
  }

  private persist(orders: Order[]): void {
    this.ordersSubject.next(orders);
    this.orders.set(orders);
    this.storage.setItem(this.key, orders);
  }
}
