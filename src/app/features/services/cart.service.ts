import { Injectable } from "@angular/core";

type ItemType = 'cvijet' | 'artikl';

interface CartData {
  cvijece: number[];
  artikli: number[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart: CartData = { cvijece: [], artikli: [] };
  private readonly KEY = 'cart_items';
  private readonly TIME_KEY = 'cart_timestamp';
  private readonly MAX_AGE = 30 * 60 * 1000; // 30 minuta u ms

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const stored = localStorage.getItem(this.KEY);
    const timestamp = Number(localStorage.getItem(this.TIME_KEY));

    if (stored && timestamp && Date.now() - timestamp < this.MAX_AGE) {
      this.cart = JSON.parse(stored);
    } else {
      this.clearCart();
    }
  }

  private saveCart() {
    localStorage.setItem(this.KEY, JSON.stringify(this.cart));
    localStorage.setItem(this.TIME_KEY, Date.now().toString());
  }

  addToCart(itemId: number, type: ItemType) {
    const key = type === 'cvijet' ? 'cvijece' : 'artikli';
    this.cart[key].push(itemId);
    this.saveCart();
  }

  getItemIds(type: ItemType): number[] {
    const key = type === 'cvijet' ? 'cvijece' : 'artikli';
    return [...this.cart[key]];
  }

  removeItem(index: number, type: ItemType) {
    const key = type === 'cvijet' ? 'cvijece' : 'artikli';
    this.cart[key].splice(index, 1);
    this.saveCart();
  }

  clearCart() {
    this.cart = { cvijece: [], artikli: [] };
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.TIME_KEY);
  }

  getTotal(itemsWithDetails: any[]): number {
    return itemsWithDetails.reduce((sum, item) => sum + item.price, 0);
  }
}
