import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

describe('AuthService', () => {
  beforeEach(async () => {
    await TestBed.resetTestingModule();
    localStorage.clear();
    await TestBed.configureTestingModule({
      providers: [AuthService, StorageService],
    }).compileComponents();
  });

  it('should reject invalid credentials', async () => {
    const auth = TestBed.inject(AuthService);
    await expect(firstValueFrom(auth.login('not-a-user@rentease.com', 'wrong'))).rejects.toThrow('Invalid email or password');
  });

  it('should login admin with seed credentials', async () => {
    const auth = TestBed.inject(AuthService);
    const user = await firstValueFrom(auth.login('admin@rentease.com', 'admin123'));
    expect(user.email).toBe('admin@rentease.com');
    expect(auth.currentUser()?.role).toBe('admin');
  });

  it('should reject duplicate registration email', async () => {
    const auth = TestBed.inject(AuthService);
    await expect(
      firstValueFrom(
        auth.register({
          name: 'Dup',
          email: 'admin@rentease.com',
          password: 'secret12',
          role: 'user',
        }),
      ),
    ).rejects.toThrow('Email already exists');
  });
});
