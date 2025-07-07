import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.services';
import { CartService } from '../../services/cart.service';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-cvjecara',
  templateUrl: './cvjecara.component.html',
  styleUrls: ['./cvjecara.component.css']
})
export class CvjecaraComponent implements OnInit {
  items: any;

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private router: Router,
    private cartService:CartService,
    private notificationService:NotificationComponent
  ){}

  cvijece: any[] = [];
  prikazanoCvijece: any[] = [];
  stavkiPoStranici: number = 9;

  ngOnInit(): void {
    this.ucitajCvijece();
  }

  ucitajCvijece(): void {
    this.http.get<any[]>('http://localhost:3000/api/flowers').subscribe(data => {
      this.cvijece = data;
      this.promijeniStranicu({ first: 0 });
    });
  }
  
  promijeniStranicu(event: any): void {
    const start = event.first;
    const end = start + this.stavkiPoStranici;
    this.prikazanoCvijece = this.cvijece.slice(start, end);
  }
  naruci(cvijet: any) {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/auth']);
      return;
    }
  
    this.cartService.addToCart(cvijet.id, 'cvijet');
    this.notificationService.showSuccess('Dodano!', `${cvijet.name} je dodan u košaricu.`);
  }
}
