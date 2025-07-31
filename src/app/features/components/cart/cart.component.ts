import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CartStore } from './store/cart.store';
import { CartItem } from '../../models/cart.model';
import { OrderDialogComponent } from './order-dialog/order-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  itemsWithDetails: CartItem[] = [];
  total = 0;
  isLoaded = false;
  @ViewChild(OrderDialogComponent) orderDialog!: OrderDialogComponent;

  constructor(
    private cartStore: CartStore,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.isLoaded = false;

    this.cartStore.loadFullCartDetails().subscribe(items => {
      this.itemsWithDetails = items;
      this.total = this.cartStore.total();
      this.isLoaded = true;
    });
  }

  getImageUrl(item: CartItem): string {
    if (item.imageUrl?.startsWith('http')) return item.imageUrl;
    if (item.imageUrl) return `${environment.apiUrl}${item.imageUrl}`;
    return this.getFallbackImage(item.category);
  }

  getFallbackImage(category: 'cvijet' | 'artikl'): string {
    return category === 'cvijet' ? 'assets/placeholder_flower.png' : 'assets/placeholder_artikli.png';
  }

  openOrderDialog() {
    this.orderDialog.show();
  }

  onOrderSubmit(userData: { fullName: string; email: string; phone: string }) {
    this.cartStore.submitOrder(userData).subscribe(() => {
      this.itemsWithDetails = [];
      this.total = 0;
      this.isLoaded = true;

      this.messageService.add({
        severity: 'success',
        summary: 'Narudžba zaprimljena',
        detail: 'Kontaktirat ćemo vas kada bude spremna.',
        life: 5000
      });
    });
  }

  removeItem(index: number) {
    const item = this.itemsWithDetails[index];
    if (!item) return;

    this.cartStore.removeItem(item.id);
    this.ngOnInit();
  }

  changeQuantity(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty >= 1 && newQty <= item.stock) {
      const updatedItem = { ...item, quantity: newQty };
      this.cartStore.removeItem(item.id);
      this.cartStore.addItem(updatedItem);
      item.quantity = newQty;
      this.total = this.cartStore.total();
    }
  }

  clearAll() {
    this.confirmationService.confirm({
      message: 'Jeste li sigurni da želite isprazniti cijelu košaricu?',
      header: 'Potvrda',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da',
      rejectLabel: 'Ne',
      accept: () => {
        this.cartStore.clearCart();
        this.ngOnInit();
      }
    });
  }
}
