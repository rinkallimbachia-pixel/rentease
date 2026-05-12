import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of } from 'rxjs';

import { Product, ProductCategory } from '../../shared/models/entities';
import { StorageService } from '../../core/storage.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly key = 'rentease_products';
  private readonly productsSubject: BehaviorSubject<Product[]>;
  readonly products$;
  readonly products = signal<Product[]>([]);

  constructor(private readonly storage: StorageService) {
    const seeded = this.storage.getItem<Product[]>(this.key, []);
    const products = this.applyImageMigrations(seeded.length ? seeded : this.getMockProducts());
    this.productsSubject = new BehaviorSubject<Product[]>(products);
    this.products$ = this.productsSubject.asObservable();
    this.products.set(products);
    this.storage.setItem(this.key, products);
  }

  getProducts(category: ProductCategory | 'all' = 'all'): Observable<Product[]> {
    return this.products$.pipe(map((items) => (category === 'all' ? items : items.filter((item) => item.category === category))), delay(250));
  }

  getById(id: string): Observable<Product | undefined> {
    return this.products$.pipe(map((items) => items.find((item) => item.id === id)), delay(200));
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const next: Product = { id: crypto.randomUUID(), ...product };
    this.persist([...this.productsSubject.value, next]);
    return of(next).pipe(delay(300));
  }

  updateProduct(product: Product): Observable<Product> {
    this.persist(this.productsSubject.value.map((item) => (item.id === product.id ? product : item)));
    return of(product).pipe(delay(300));
  }

  deleteProduct(id: string): Observable<void> {
    this.persist(this.productsSubject.value.filter((item) => item.id !== id));
    return of(void 0).pipe(delay(250));
  }

  toggleAvailability(id: string): Observable<void> {
    this.persist(this.productsSubject.value.map((item) => (item.id === id ? { ...item, available: !item.available } : item)));
    return of(void 0).pipe(delay(220));
  }

  private persist(products: Product[]): void {
    this.productsSubject.next(products);
    this.products.set(products);
    this.storage.setItem(this.key, products);
  }

  private getMockProducts(): Product[] {
    return [
      { id: crypto.randomUUID(), name: 'Bed', category: 'Furniture', pricePerMonth: 500, deposit: 3000, tenureOptions: [3, 6, 12], image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', available: true },
      { id: crypto.randomUUID(), name: 'Sofa', category: 'Furniture', pricePerMonth: 700, deposit: 4000, tenureOptions: [3, 6, 12], image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', available: true },
      { id: crypto.randomUUID(), name: 'Washing Machine', category: 'Appliance', pricePerMonth: 800, deposit: 5000, tenureOptions: [6, 12], image: 'assets/washing-machine.svg', available: true },
      { id: crypto.randomUUID(), name: 'Refrigerator', category: 'Appliance', pricePerMonth: 1000, deposit: 6000, tenureOptions: [6, 12, 18], image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=1200&q=80', available: true },
      { id: crypto.randomUUID(), name: 'TV', category: 'Appliance', pricePerMonth: 600, deposit: 3500, tenureOptions: [3, 6, 12], image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80', available: true },
    ];
  }

  private applyImageMigrations(products: Product[]): Product[] {
    return products.map((product) => {
      if (product.name.toLowerCase() === 'washing machine') {
        return { ...product, image: 'assets/washing-machine.svg' };
      }
      return product;
    });
  }
}
