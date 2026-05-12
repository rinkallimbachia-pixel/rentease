import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <section class="fade-in mx-auto max-w-md">
      <div class="re-panel-lg overflow-hidden">
        <div class="border-b border-re-border bg-re-canvas/80 px-6 py-5">
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-re-ink text-lg font-bold text-white shadow-re">R</span>
            <div>
              <p class="re-eyebrow text-re-subtle">Join</p>
              <h1 class="re-display mt-1 text-2xl">Create account</h1>
              <p class="mt-1 text-sm text-re-muted">Start renting in minutes.</p>
            </div>
          </div>
        </div>
        <div class="p-6 sm:p-8">
          <form #registerForm="ngForm" class="space-y-4" (ngSubmit)="register(registerForm)">
            <div>
              <label class="re-eyebrow mb-1.5 block text-re-subtle" for="reg-name">Full name</label>
              <input
                id="reg-name"
                [(ngModel)]="name"
                name="name"
                required
                minlength="2"
                maxlength="80"
                pattern=".*\\S.*"
                autocomplete="name"
                placeholder="Your name"
                class="re-input"
                #nameCtrl="ngModel"
              />
              <p *ngIf="nameCtrl.invalid && nameCtrl.touched" class="mt-1 text-xs text-re-danger">
                <span *ngIf="nameCtrl.errors?.['required']">Name is required.</span>
                <span *ngIf="nameCtrl.errors?.['minlength']">Use at least 2 characters.</span>
                <span *ngIf="nameCtrl.errors?.['pattern']">Name cannot be only spaces.</span>
                <span *ngIf="nameCtrl.errors?.['maxlength']">Name is too long.</span>
              </p>
            </div>
            <div>
              <label class="re-eyebrow mb-1.5 block text-re-subtle" for="reg-email">Email</label>
              <input
                id="reg-email"
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
              <label class="re-eyebrow mb-1.5 block text-re-subtle" for="reg-password">Password</label>
              <input
                id="reg-password"
                [(ngModel)]="password"
                name="password"
                type="password"
                required
                minlength="6"
                maxlength="128"
                autocomplete="new-password"
                placeholder="Min. 6 characters"
                class="re-input"
                #passwordCtrl="ngModel"
              />
              <p *ngIf="passwordCtrl.invalid && passwordCtrl.touched" class="mt-1 text-xs text-re-danger">
                <span *ngIf="passwordCtrl.errors?.['required']">Password is required.</span>
                <span *ngIf="passwordCtrl.errors?.['minlength']">Use at least 6 characters.</span>
                <span *ngIf="passwordCtrl.errors?.['maxlength']">Password is too long.</span>
              </p>
            </div>
            <p *ngIf="error()" class="text-sm font-medium text-re-danger">{{ error() }}</p>
            <button type="submit" class="re-btn-primary w-full">Register</button>
          </form>
          <p class="mt-6 text-center text-sm text-re-muted">
            Already registered?
            <a routerLink="/login" class="font-semibold text-re-accent hover:text-re-accent-hover">Sign in</a>
          </p>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected name = '';
  protected email = '';
  protected password = '';
  protected readonly error = signal('');

  protected register(form: NgForm): void {
    this.error.set('');
    form.control.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    this.authService
      .register({ name: this.name.trim(), email: this.email.trim(), password: this.password, role: 'user' })
      .subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: (err: Error) => this.error.set(err.message),
    });
  }
}
