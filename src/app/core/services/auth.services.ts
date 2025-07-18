import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse } from '../models/auth.model';
import { AuthStore } from '../store/auth.store';
import { CartStore } from '../../features/components/cart/store/cart.store';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl + '/api/auth';

  constructor(
    private http: HttpClient,
    private authStore: AuthStore,
    private cartStore: CartStore,
    private router: Router
  ) {}

  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.api}/login`, data);
  }

  loginAndRedirect(data: { email: string; password: string }) {
    this.login(data).subscribe({
      next: ({ user, token }) => {
        this.authStore.login(user, token);
  
        if (user.role === 'employee') {
          this.router.navigate(['/narudzbe']);
        } else if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Login error', err);
        // po želji: toast, error state, itd.
      },
    });
  }

  register(data: { email: string; password: string; fullName: string }) {
    return this.http.post<AuthResponse>(`${this.api}/register`, data);
  }

  getToken(): string | null {
    return this.authStore.token();
  }

  logout() {
    const token = this.authStore.token();

    if (token) {
      this.cartStore.clearCart();
    }

    this.authStore.logout();
  }

  get currentUser() {
    return this.authStore.user();
  }

  get isLoggedIn() {
    return this.authStore.isLoggedIn();
  }
}
