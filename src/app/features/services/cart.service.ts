import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.services';

type ItemType = 'cvijet' | 'artikl';

export interface CartItem {
  itemId: any;
  type: ItemType;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly LOCAL_KEY = 'cart_items';
  private localCart: CartItem[] = [];
  private cart$ = new BehaviorSubject<CartItem[]>([]);

  private authService: AuthService;

  constructor(
    private http: HttpClient,
    private injector: Injector
  ) {
    this.authService = this.injector.get(AuthService);
    this.loadLocalCart();

    if (this.authService.hasToken()) {
      this.syncLocalToBackend();
    }
  }

  private loadLocalCart() {
    const stored = localStorage.getItem(this.LOCAL_KEY);
    if (stored) {
      this.localCart = JSON.parse(stored);
      this.cart$.next(this.localCart);
    }
  }

  private saveLocalCart() {
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(this.localCart));
    this.cart$.next(this.localCart);
  }

  addToCart(itemId: number, type: ItemType): void {
    if (this.authService.hasToken()) {
      this.getCartItems().subscribe((items) => {
        const updatedItems = [...items];
        const existing = updatedItems.find(i => i.itemId === itemId && i.type === type);
  
        if (existing) {
          existing.quantity++;
        } else {
          updatedItems.push({ itemId, type, quantity: 1 });
        }
  
        const artikli = updatedItems
          .filter(i => i.type === 'artikl')
          .map(i => ({ id: i.itemId, quantity: i.quantity }));
  
        const cvijece = updatedItems
          .filter(i => i.type === 'cvijet')
          .map(i => ({ id: i.itemId, quantity: i.quantity }));
  
        this.http.post('http://localhost:3000/api/cart/sync', { artikli, cvijece }).subscribe();
      });
      return;
    }
    const existing = this.localCart.find(i => i.itemId === itemId && i.type === type);
    if (existing) {
      existing.quantity++;
    } else {
      this.localCart.push({ itemId, type, quantity: 1 });
    }
    this.saveLocalCart();
  }
  

  getCartItems(): Observable<CartItem[]> {
    if (this.authService.hasToken()) {
      return this.http.get<CartItem[]>('http://localhost:3000/api/cart');
    }
    return this.cart$.asObservable();
  }

  syncLocalToBackend(): void {
    if (!this.localCart.length) return;

    const artikli = this.localCart.filter(i => i.type === 'artikl');
    const cvijece = this.localCart.filter(i => i.type === 'cvijet');

    this.http.post('http://localhost:3000/api/cart/sync', { artikli, cvijece }).subscribe(() => {
      this.clearLocal();
    });
  }

  removeItem(itemId: number, type: ItemType): void {
    if (this.authService.hasToken()) {
      // TODO: Implement backend removal if needed
    } else {
      this.localCart = this.localCart.filter(i => !(i.itemId === itemId && i.type === type));
      this.saveLocalCart();
    }
  }

  clearCart(): void {
    if (this.authService.hasToken()) {
      this.http.post('http://localhost:3000/api/cart/clear', {}).subscribe(() => {
        this.cart$.next([]);
      });
    } else {
      this.clearLocal();
    }
  }

  private clearLocal(): void {
    this.localCart = [];
    localStorage.removeItem(this.LOCAL_KEY);
    this.cart$.next([]);
  }

  getQuantity(type: ItemType, id: number): number {
    const found = this.localCart.find(i => i.type === type && i.itemId === id);
    return found ? found.quantity : 0;
  }

  updateQuantity(type: ItemType, id: number, quantity: number): void {
    if (this.authService.hasToken()) {
      this.http.patch('http://localhost:3000/api/cart/item', {
        id,
        type,
        quantity
      }).subscribe();
    } else {
      const item = this.localCart.find(i => i.itemId === id && i.type === type);
      if (item) {
        item.quantity = quantity;
        this.saveLocalCart();
      }
    }
  }
  getItemIds(type: ItemType): number[] {
    if (this.authService.hasToken()) {
      console.warn('getItemIds is not reliable for logged-in users – use getCartItems()');
      return [];
    }
  
    return this.localCart
      .filter(i => i.type === type)
      .map(i => i.itemId);
  }
  
  getTotal(items: { price: number; quantity: number }[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
