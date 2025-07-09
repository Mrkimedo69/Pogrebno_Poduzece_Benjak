import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartStore } from '../../components/cart/store/cart.store';
import { AuthStore } from '../../../core/store/auth.store';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { PogrebniArtikl } from '../../models/pogrebni-artikli.model';
import { ArtikliStore } from './store/pogrebni-artikli.store';

@Component({
  selector: 'app-pogrebni-artikli',
  templateUrl: './pogrebni-artikli.component.html',
  styleUrls: ['./pogrebni-artikli.component.css']
})
export class PogrebniArtikliComponent implements OnInit {
  itemsPerPage = 10;
  currentPage = 1;

  constructor(
    public artikliStore: ArtikliStore,
    private cartStore: CartStore,
    private authStore: AuthStore,
    private router: Router,
    private notificationService: NotificationComponent
  ) {}

  ngOnInit(): void {
    this.artikliStore.fetchAll();
  }

  get artikli(): PogrebniArtikl[] {
    return this.artikliStore.artikli();
  }

  get totalPages(): number {
    return Math.ceil(this.artikli.length / this.itemsPerPage);
  }

  getCurrentItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.artikli.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  dodajUKosaricu(item: PogrebniArtikl) {
    // Ako želiš zahtijevati login, otkomentiraj:
    // if (!this.authStore.isLoggedIn()) {
    //   this.router.navigate(['/auth']);
    //   return;
    // }

    this.cartStore.addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      stock: item.stock,
      quantity: 1,
      type: 'artikl'
    });

    this.notificationService.showSuccess('Dodano!', `${item.name} je dodan u košaricu.`);
  }

  getItemQuantity(id: number): number {
    return this.cartStore.artiklQuantities()[id] ?? 0;
  }
}
