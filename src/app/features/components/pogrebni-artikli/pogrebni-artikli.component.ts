import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.services';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-pogrebni-artikli',
  templateUrl: './pogrebni-artikli.component.html',
  styleUrls: ['./pogrebni-artikli.component.css']
})
export class PogrebniArtikliComponent {
  pogrebni_artikli: any[] = [];
  itemsPerPage = 10;
  currentPage = 1;

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationComponent
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/api/artikli').subscribe(data => {
      this.pogrebni_artikli = data;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.pogrebni_artikli.length / this.itemsPerPage);
  }

  getCurrentItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.pogrebni_artikli.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  dodajUKosaricu(item: any) {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.cartService.addToCart(item.id, 'artikl');
    this.notificationService.showSuccess('Dodano!', `${item.name} je dodan u košaricu.`);
  }
  
  
}
