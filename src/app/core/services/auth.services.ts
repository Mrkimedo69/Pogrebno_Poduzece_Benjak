import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse } from '../models/auth.model';
import { AuthStore } from '../store/auth.store';
import { CartStore } from '../../features/components/cart/store/cart.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000/api/auth';

  constructor(
    private http: HttpClient,
    private authStore: AuthStore,
    private cartStore: CartStore
  ) {}


  // HTTP pozivi
  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.api}/login`, data);
  }

  register(data: { email: string; password: string; fullName: string }) {
    return this.http.post<AuthResponse>(`${this.api}/register`, data);
  }

  // TOKEN dohvaća iz store-a
  getToken(): string | null {
    return this.authStore.token();
  }

  // LOGOUT sinkronizira se s cartom i store-om
  logout() {
    const token = this.authStore.token();

    if (token) {
      this.cartStore.clearCart();
    }

    this.authStore.logout();
  }

  // Korisnik dohvaćen iz store-a
  get currentUser() {
    return this.authStore.user();
  }

  get isLoggedIn() {
    return this.authStore.isLoggedIn();
  }
}
