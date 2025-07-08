import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AuthResponse } from '../models/auth.model';
import { CartService } from '../../features/services/cart.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000/api/auth';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userSubject = new BehaviorSubject<any>(this.loadUser());
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private injector: Injector
  ) {}

  private get cartService(): CartService {
    return this.injector.get(CartService);
  }

  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.api}/login`, data);
  }

  register(data: { email: string; password: string; fullName: string }) {
    return this.http.post<AuthResponse>(`${this.api}/register`, data);
  }

  storeToken(token: string) {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);
  }

  storeUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    const wasLoggedIn = this.hasToken();

    localStorage.removeItem('token');
  
    if (wasLoggedIn) {
      this.cartService.clearCart();
    }
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
    this.userSubject.next(null);
  }

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  loadUser() {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }
}
