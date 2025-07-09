import { Injectable, computed, signal } from '@angular/core';
import { AuthStore } from '../../../../core/store/auth.store';
import { CartItem } from '../../../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly LOCAL_KEY = 'cart_items';

  private readonly _items = signal<CartItem[]>(this.loadFromStorage());
  readonly items = computed(() => this._items());
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  constructor(private auth: AuthStore) {
    if (this.auth.isLoggedIn() && this.hasLocalItems()) {
      this.syncToBackend();
      this.clearStorage();
    }
  }

  addItem(item: CartItem) {
    const exists = this._items().find(i => i.id === item.id && i.type === item.type);
    if (exists) {
      this._items.update(items =>
        items.map(i =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      );
    } else {
      this._items.update(items => [...items, item]);
    }

    this.persist();
    if (this.auth.isLoggedIn()) this.syncToBackend();
  }

  removeItem(id: number) {
    this._items.update(items => items.filter(i => i.id !== id));
    this.persist();
    if (this.auth.isLoggedIn()) this.syncToBackend();
  }

  updateQuantity(id: number, quantity: number) {
    this._items.update(items =>
      items.map(i => i.id === id ? { ...i, quantity } : i)
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

  private syncToBackend() {
    const items = this.getItems();

    const artikli = items
      .filter(i => i.type === 'artikl')
      .map(i => ({ id: i.id, quantity: i.quantity }));

    const cvijece = items
      .filter(i => i.type === 'cvijet')
      .map(i => ({ id: i.id, quantity: i.quantity }));

    fetch('http://localhost:3000/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artikli, cvijece })
    });
  }

  private clearBackendCart() {
    fetch('http://localhost:3000/api/cart/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private updateItemOnBackend(id: number, quantity: number) {
    fetch('http://localhost:3000/api/cart/item', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity })
    });
  }
  readonly artiklQuantities = computed(() => {
    const map: { [id: number]: number } = {};
    this._items().forEach(item => {
      if (item.type === 'artikl') {
        map[item.id] = item.quantity;
      }
    });
    return map;
  });
  readonly cvijetQuantities = computed(() => {
    const items = this.items();
    const map: { [id: number]: number } = {};
  
    for (const item of items) {
      if (item.type === 'cvijet') {
        map[item.id] = item.quantity;
      }
    }
  
    return map;
  });
  
}
