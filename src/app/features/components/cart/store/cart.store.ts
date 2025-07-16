import { Injectable, computed, signal } from '@angular/core';
import { AuthStore } from '../../../../core/store/auth.store';
import { CartItem } from '../../../models/cart.model';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, map, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

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

    this.http.post(`${environment.apiUrl}/cart/sync`, { artikli, cvijece }).subscribe();
  }

  private clearBackendCart() {
    this.http.post(`${environment.apiUrl}/cart/clear`, {}).subscribe();
  }

  private updateItemOnBackend(id: number, quantity: number) {
    this.http.patch(`${environment.apiUrl}/cart/item`, { id, type: 'artikl', quantity }).subscribe();
  }

  private filterByCategory(items: CartItem[], category: 'artikl' | 'cvijet') {
    return items
      .filter(i => i.category === category)
      .map(i => ({ id: i.id, quantity: i.quantity }));
  }
    loadFullCartDetails(): Observable<CartItem[]> {
    const items = this.getItems();

    const artikliMap = new Map(items.filter(i => i.category === 'artikl').map(i => [i.id, i.quantity]));
    const cvijeceMap = new Map(items.filter(i => i.category === 'cvijet').map(i => [i.id, i.quantity]));

    const artikliIds = Array.from(artikliMap.keys());
    const cvijeceIds = Array.from(cvijeceMap.keys());

    if (artikliIds.length === 0 && cvijeceIds.length === 0) {
      this._items.set([]);
      return of([]);
    }

    return forkJoin({
      artikli: artikliIds.length > 0
        ? this.http.post<any[]>(`${environment.apiUrl}/artikli/batch`, { ids: artikliIds })
        : of([]),
      cvijece: cvijeceIds.length > 0
        ? this.http.post<any[]>(`${environment.apiUrl}/flowers/batch`, { ids: cvijeceIds })
        : of([])
    }).pipe(
      map(({ artikli, cvijece }) => {
        const artikliWithType: CartItem[] = artikli.map(a => ({
          ...a,
          category: 'artikl' as const,
          quantity: artikliMap.get(a.id) || 0
        }));

        const cvijeceWithType: CartItem[] = cvijece.map(f => ({
          ...f,
          category: 'cvijet' as const,
          quantity: cvijeceMap.get(f.id) || 0
        }));

        const fullCart = [...artikliWithType, ...cvijeceWithType];

        this.setCart(fullCart);
        return fullCart;
      })
    );
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
  submitOrder(userData: { fullName: string; email: string; phone: string }): Observable<any> {
    const payload = {
      ...userData,
      totalPrice: this.total(),
      items: this.getItems().map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        category: i.category,
        type: i.category
      }))
    };

    return this.http.post(`${environment.apiUrl}/orders`, payload).pipe(
      tap(() => {
        this.clearCart();
      })
    );
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
