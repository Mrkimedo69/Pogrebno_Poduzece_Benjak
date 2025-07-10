import { ChangeDetectorRef, Component, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthStore } from '../../store/auth.store';
import { CartStore } from '../../../features/components/cart/store/cart.store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  items: MenuItem[] = [];
  readonly isLoggedIn = this.authStore.isLoggedIn; 
  readonly user = this.authStore.user;

  constructor(
    private authStore: AuthStore,
    private cartStore: CartStore,
    private router: Router
  ) {
    effect(() => {
      const user = this.authStore.user(); // direktni pristup signalu
  
      if (user?.role !== 'employee') {
        this.items = [
          {
            label: 'Cvjećara',
            icon: 'pi pi-sun',
            routerLink: '/cvjecara'
          },
          {
            label: 'Potrepštine',
            icon: 'pi pi-box',
            routerLink: '/pogrebni_artikli'
          },
          {
            label: 'Dizajner groba',
            icon: 'pi pi-cog',
            routerLink: '/grobni_dizajner'
          }
        ];
      } else {
        this.items = [];
      }
    });
  }
  
  
  logout() {
    this.authStore.logout();
    this.cartStore.clearCart();
    this.router.navigate(['/']);
  }

  isEmployee() {
    return this.user()?.role === 'employee';
  }
  
}
