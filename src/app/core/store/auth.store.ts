import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../features/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<User | null>(this.loadUser());
  private readonly _token = signal<string | null>(this.loadToken());
  readonly role = computed(() => this._user()?.role ?? 'guest');

  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly isEmployee = computed(() => this.role() === 'employee');

  readonly user = computed(() => this._user());
  readonly token = computed(() => this._token());
  readonly isLoggedIn = computed(() => !!this._user() && !!this._token());

  login(user: User, token: string) {
    this._user.set(user);
    this._token.set(token);
    this.saveToStorage(user, token);
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    this.clearStorage();
  }

  private saveToStorage(user: User, token: string) {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
  }

  private loadUser(): User | null {
    const data = localStorage.getItem('auth_user');
    return data ? JSON.parse(data) : null;
  }

  private loadToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private clearStorage() {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }
}
