import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.services';
import { CartService } from '../../services/cart.service';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { FlowerModel } from '../../models/flower.model';

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

  cvijece: FlowerModel[] = [];
  prikazanoCvijece: any[] = [];
  stavkiPoStranici: number = 9;
  itemQuantities: { [id: number]: number } = {};


  ngOnInit(): void {
    this.ucitajCvijece();
  }

  ucitajCvijece(): void {
    this.http.get<any[]>('http://localhost:3000/api/flowers').subscribe(data => {
      this.cvijece = data;
      this.promijeniStranicu({ first: 0 });

      this.cartService.getCartItems().subscribe((cart) => {
        this.itemQuantities = {};
        cart
          .filter(i => i.type === 'cvijet')
          .forEach(i => {
            this.itemQuantities[i.itemId] = i.quantity;
          });
      });
      
    });
  }
  
  promijeniStranicu(event: any): void {
    const start = event.first;
    const end = start + this.stavkiPoStranici;
    this.prikazanoCvijece = this.cvijece.slice(start, end);
  }
naruci(cvijet: any) {
  // if (!this.authService.hasToken()) {
  //   this.router.navigate(['/auth']);
  //   return;
  // }

  this.cartService.addToCart(cvijet.id, 'cvijet');

  if (this.itemQuantities[cvijet.id] === undefined) {
    this.itemQuantities[cvijet.id] = 1;
  } else {
    this.itemQuantities[cvijet.id]++;
  }

  this.notificationService.showSuccess('Dodano!', `${cvijet.name} je dodan u košaricu.`);
}

}
