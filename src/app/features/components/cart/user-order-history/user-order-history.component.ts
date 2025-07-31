import { Component, OnInit } from '@angular/core';
import { CartStore } from '../store/cart.store';
import { OrderModel } from '../../../models/order.model';

@Component({
  selector: 'app-user-order-history',
  templateUrl: './user-order-history.component.html',
  styleUrls: ['./user-order-history.component.css']
})
export class UserOrderHistoryComponent implements OnInit {
  constructor(public cartStore: CartStore) {}

  ngOnInit(): void {
    this.cartStore.fetchUserOrders();
  }

  getStatusColor(status: string): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'resolved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  }
  getOrderDate(order: OrderModel): string {
  return order.archivedAt ?? order.createdAt ?? '';
}

  getOrderLabel(order: OrderModel): string {
    const date = this.getOrderDate(order);
    const formattedDate = new Date(date).toLocaleString('hr-HR');

    if (order.status === 'resolved') {
      return `✅ Obavljeno: ${formattedDate} (${order.resolvedBy ?? 'Nepoznato'})`;
    } else if (order.status === 'rejected') {
      return `❌ Odbijeno: ${formattedDate} (${order.resolvedBy ?? 'Nepoznato'})`;
    } else {
      return `🕓 Kreirano: ${formattedDate}`;
    }
  }
  
  sortOrders(orders: OrderModel[]): OrderModel[] {
    const statusOrder = { pending: 0, resolved: 1, rejected: 2 };

    return orders.slice().sort((a, b) => {
      // prvo po statusu
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // zatim po datumu (noviji prvi)
      const dateA = new Date(a.archivedAt ?? a.createdAt ?? '').getTime();
      const dateB = new Date(b.archivedAt ?? b.createdAt ?? '').getTime();
      return dateB - dateA;
    });
  }


}
