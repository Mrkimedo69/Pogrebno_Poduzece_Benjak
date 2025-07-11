import { Injectable, computed, signal } from '@angular/core';
import { AuthStore } from '../../../../core/store/auth.store';
import { CartItem } from '../../../models/cart.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly LOCAL_KEY = 'cart_items';

  private readonly _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items = computed(() => this._items());
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  readonly artiklQuantities = computed(() => this.buildQuantitiesMap('artikl'));
  readonly cvijetQuantities = computed(() => this.buildQuantitiesMap('cvijet'));

  constructor(private auth: AuthStore, private http: HttpClient) {
    if (this.auth.isLoggedIn() && this.hasLocalItems()) {
      this.syncToBackend();
      this.clearStorage();
    }
  }

  addItem(item: CartItem) {
    const currentItems = this._items();
    const exists = currentItems.find(i => i.id === item.id && i.category === item.category);

    if (exists) {
      this._items.set(
        currentItems.map(i =>
          i.id === item.id && i.category === item.category
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      );
    } else {
      this._items.set([...currentItems, item]);
    }

    this.persist();
    if (this.auth.isLoggedIn()) this.syncToBackend();
  }

  removeItem(id: number) {
    this._items.set(this._items().filter(i => i.id !== id));
    this.persist();
    if (this.auth.isLoggedIn()) this.syncToBackend();
  }

  updateQuantity(id: number, quantity: number) {
    this._items.set(
      this._items().map(i =>
        i.id === id ? { ...i, quantity } : i
      )
    );
    this.persist();
    if (this.auth.isLoggedIn()) this.updateItemOnBackend(id, quantity);
  }

  clearCart() {
    this._items.set([]);
    this.clearStorage();
    if (this.auth.isLoggedIn()) this.clearBackendCart();
  }

  setCart(items: CartItem[]) {
    this._items.set(items);
    this.persist();
  }

  getItems(): CartItem[] {
    return this._items();
  }

  private syncToBackend() {
    const items = this.getItems();
    const artikli = this.filterByCategory(items, 'artikl');
    const cvijece = this.filterByCategory(items, 'cvijet');

    this.http.post('http://localhost:3000/api/cart/sync', { artikli, cvijece }).subscribe();
  }

  private clearBackendCart() {
    this.http.post('http://localhost:3000/api/cart/clear', {}).subscribe();
  }

  private updateItemOnBackend(id: number, quantity: number) {
    this.http.patch('http://localhost:3000/api/cart/item', { id, type: 'artikl', quantity }).subscribe();
  }

  private filterByCategory(items: CartItem[], category: 'artikl' | 'cvijet') {
    return items
      .filter(i => i.category === category)
      .map(i => ({ id: i.id, quantity: i.quantity }));
  }

  private buildQuantitiesMap(category: 'artikl' | 'cvijet') {
    const map: { [id: number]: number } = {};
    this._items().forEach(item => {
      if (item.category === category) {
        map[item.id] = item.quantity;
      }
    });
    return map;
  }

  private persist() {
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(this._items()));
  }

  private loadFromStorage(): CartItem[] {
    const stored = localStorage.getItem(this.LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private hasLocalItems(): boolean {
    return !!localStorage.getItem(this.LOCAL_KEY);
  }

  private clearStorage() {
    localStorage.removeItem(this.LOCAL_KEY);
  }
}
