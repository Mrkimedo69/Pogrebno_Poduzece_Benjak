import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.services';
import { CartService } from '../../../features/services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  
  constructor(
    public authService: AuthService, 
    private router: Router,
    private cartService: CartService
  ) {}

  items: MenuItem[] = [];
  isLoggedIn = false;
  user: any;

  ngOnInit() {
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
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });

    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }
  logout() {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }
}
