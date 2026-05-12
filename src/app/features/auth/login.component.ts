import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <section class="fade-in mx-auto max-w-md">
      <div class="re-panel-lg overflow-hidden">
        <div class="border-b border-re-border bg-re-canvas/80 px-6 py-5">
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-re-ink text-lg font-bold text-white shadow-re">R</span>
            <div>
              <p class="re-eyebrow text-re-subtle">Sign in</p>
              <h1 class="re-display mt-1 text-2xl">Welcome back</h1>
              <p class="mt-1 text-sm text-re-muted">Rentals, checkout, and support in one place.</p>
            </div>
          </div>
        </div>
        <div class="p-6 sm:p-8">
          <p class="rounded-2xl border border-re-accent/25 bg-re-accent-soft/40 px-4 py-3 text-xs font-medium text-re-ink">
            Admin demo: <span class="font-mono font-semibold text-re-accent">admin@rentease.com</span> /
            <span class="font-mono font-semibold">admin123</span>
          </p>
          <p class="mt-2 rounded-2xl border border-re-border bg-re-canvas px-4 py-3 text-xs font-medium text-re-muted">
            Vendor demo: <span class="font-mono font-semibold text-re-accent">vendor@rentease.com</span> /
            <span class="font-mono font-semibold">vendor123</span>
          </p>
          <form #loginForm="ngForm" class="mt-6 space-y-4" (ngSubmit)="login(loginForm)">
            <div>
              <label class="re-eyebrow mb-1.5 block text-re-subtle" for="login-email">Email</label>
              <input
                id="login-email"
                [(ngModel)]="email"
                name="email"
                type="email"
                email
                required
                maxlength="254"
                autocomplete="email"
                placeholder="you@home.com"
                class="re-input"
                #emailCtrl="ngModel"
              />
              <p *ngIf="emailCtrl.invalid && emailCtrl.touched" class="mt-1 text-xs text-re-danger">
                <span *ngIf="emailCtrl.errors?.['required']">Email is required.</span>
                <span *ngIf="emailCtrl.errors?.['email']">Enter a valid email address.</span>
                <span *ngIf="emailCtrl.errors?.['maxlength']">Email is too long.</span>
              </p>
            </div>
            <div>
              <label class="re-eyebrow mb-1.5 block text-re-subtle" for="login-password">Password</label>
              <input
                id="login-password"
                [(ngModel)]="password"
                name="password"
                type="password"
                required
                maxlength="128"
                autocomplete="current-password"
                placeholder="••••••••"
                class="re-input"
                #passwordCtrl="ngModel"
              />
              <p *ngIf="passwordCtrl.invalid && passwordCtrl.touched" class="mt-1 text-xs text-re-danger">
                <span *ngIf="passwordCtrl.errors?.['required']">Password is required.</span>
                <span *ngIf="passwordCtrl.errors?.['maxlength']">Password is too long.</span>
              </p>
            </div>
            <p *ngIf="error()" class="text-sm font-medium text-re-danger">{{ error() }}</p>
            <button type="submit" class="re-btn-primary w-full">Continue</button>
          </form>
          <p class="mt-6 text-center text-sm text-re-muted">
            New here?
            <a routerLink="/register" class="font-semibold text-re-accent hover:text-re-accent-hover">Create an account</a>
          </p>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';
  protected readonly error = signal('');

  protected login(form: NgForm): void {
    this.error.set('');
    form.control.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    this.authService.login(this.email.trim(), this.password).subscribe({
      next: () => {
        const raw = this.route.snapshot.queryParamMap.get('returnUrl');
        const safe = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/products';
        this.router.navigateByUrl(safe);
      },
      error: (err: Error) => this.error.set(err.message),
    });
  }
}
