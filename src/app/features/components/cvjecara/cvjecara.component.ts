import { Component, effect, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartStore } from '../../components/cart/store/cart.store';
import { CvjecaraStore } from './store/cvjecara.store';
import { AuthStore } from '../../../core/store/auth.store';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { FlowerModel } from '../../models/flower.model';

@Component({
  selector: 'app-cvjecara',
  templateUrl: './cvjecara.component.html',
  styleUrls: ['./cvjecara.component.css']
})
export class CvjecaraComponent implements OnInit {
  prikazanoCvijece: FlowerModel[] = [];
  stavkiPoStranici: number = 9;

  constructor(
    public cvjecaraStore: CvjecaraStore,
    private cartStore: CartStore,
    private authStore: AuthStore,
    private router: Router,
    private notificationService: NotificationComponent
  ) {}

  ngOnInit(): void {
    this.cvjecaraStore.fetchAll().subscribe(() => {
      this.promijeniStranicu({ first: 0 });
    });
  }

  get cvijece(): FlowerModel[] {
    return this.cvjecaraStore.flowers();
  }

  promijeniStranicu(event: any): void {
    const start = event.first;
    const end = start + this.stavkiPoStranici;
    this.prikazanoCvijece = this.cvjecaraStore.flowers().slice(start, end);
  }

  naruci(cvijet: FlowerModel) {
    // Ako želiš zahtijevati login:
    // if (!this.authStore.isLoggedIn()) {
    //   this.router.navigate(['/auth']);
    //   return;
    // }

    this.cartStore.addItem({
      id: cvijet.id,
      name: cvijet.name,
      price: cvijet.price,
      stock: cvijet.stock,
      quantity: 1,
      type: 'cvijet'
    });

    this.notificationService.showSuccess('Dodano!', `${cvijet.name} je dodan u košaricu.`);
  }

  getItemQuantity(id: number): number {
    return this.cartStore.cvijetQuantities()[id] ?? 0;
  }
  
}
