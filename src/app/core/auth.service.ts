import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable, delay, of, throwError } from 'rxjs';

import { User } from '../shared/models/entities';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersKey = 'rentease_users';
  private readonly sessionKey = 'rentease_session';

  private readonly usersSubject: BehaviorSubject<User[]>;
  readonly users$;
  readonly users = signal<User[]>([]);

  private readonly currentUserSignal = signal<User | null>(null);
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  readonly isVendor = computed(() => this.currentUserSignal()?.role === 'vendor');

  constructor(private readonly storage: StorageService) {
    const seededUsers = this.storage.getItem<User[]>(this.usersKey, []);
    const users = seededUsers.length ? this.ensureSystemUsers(this.normalizeUsers(seededUsers)) : this.getSeedUsers();

    this.usersSubject = new BehaviorSubject<User[]>(users);
    this.users$ = this.usersSubject.asObservable();
    this.users.set(users);
    this.storage.setItem(this.usersKey, users);

    const session = this.storage.getItem<{ token: string; userId: string } | null>(this.sessionKey, null);
    if (session) {
      this.currentUserSignal.set(users.find((item) => item.id === session.userId) ?? null);
    }
  }

  register(payload: Omit<User, 'id'>): Observable<User> {
    const users = this.usersSubject.value;
    if (users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
      return throwError(() => new Error('Email already exists'));
    }

    const user: User = { id: crypto.randomUUID(), ...payload };
    this.persistUsers([...users, user]);
    return of(user).pipe(delay(450));
  }

  login(email: string, password: string): Observable<User> {
    const user = this.usersSubject.value.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password,
    );

    if (!user) {
      return throwError(() => new Error('Invalid email or password'));
    }

    this.storage.setItem(this.sessionKey, { token: crypto.randomUUID(), userId: user.id });
    this.currentUserSignal.set(user);
    return of(user).pipe(delay(400));
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.storage.removeItem(this.sessionKey);
  }

  private persistUsers(users: User[]): void {
    this.usersSubject.next(users);
    this.users.set(users);
    this.storage.setItem(this.usersKey, users);
  }

  getDefaultVendorId(): string | null {
    return this.users().find((user) => user.role === 'vendor')?.id ?? null;
  }

  private normalizeUsers(users: User[]): User[] {
    return users.map((user) => ({ ...user, role: user.role ?? (user.email === 'admin@rentease.com' ? 'admin' : 'user') }));
  }

  private getSeedUsers(): User[] {
    return [
      { id: crypto.randomUUID(), name: 'Admin User', email: 'admin@rentease.com', password: 'admin123', role: 'admin' },
      { id: crypto.randomUUID(), name: 'City Vendor', email: 'vendor@rentease.com', password: 'vendor123', role: 'vendor' },
    ];
  }

  private ensureSystemUsers(users: User[]): User[] {
    const next = [...users];
    if (!next.some((user) => user.email.toLowerCase() === 'admin@rentease.com')) {
      next.push({ id: crypto.randomUUID(), name: 'Admin User', email: 'admin@rentease.com', password: 'admin123', role: 'admin' });
    }
    if (!next.some((user) => user.email.toLowerCase() === 'vendor@rentease.com')) {
      next.push({ id: crypto.randomUUID(), name: 'City Vendor', email: 'vendor@rentease.com', password: 'vendor123', role: 'vendor' });
    }
    return next;
  }
}
