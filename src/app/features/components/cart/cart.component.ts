import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { Flower } from '../../models/flower.model';
import { forkJoin, of } from 'rxjs';
import { PogrebniArtikl } from '../../models/pogrebni-artikli.model';

type CartItem =
  | (PogrebniArtikl & { type: 'artikl' })
  | (Flower & { type: 'cvijet' });

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  itemsWithDetails: CartItem[] = [];
  total = 0;
  isLoaded = false;

  constructor(private cartService: CartService, private http: HttpClient) {}

  ngOnInit() {
    const artikliIds = this.cartService.getItemIds('artikl');
    const cvijeceIds = this.cartService.getItemIds('cvijet');

    console.log('📦 Artikli ID-ovi iz storagea:', artikliIds);
    console.log('🌸 Cvijeće ID-ovi iz storagea:', cvijeceIds);

    if (artikliIds.length === 0 && cvijeceIds.length === 0) {
      this.itemsWithDetails = [];
      this.total = 0;
      this.isLoaded = true;
      return;
    }

    forkJoin({
      artikli: artikliIds.length > 0
        ? this.http.post<PogrebniArtikl[]>('http://localhost:3000/api/artikli/batch', { ids: artikliIds })
        : of([]),
      cvijece: cvijeceIds.length > 0
        ? this.http.post<Flower[]>('http://localhost:3000/api/flowers/batch', { ids: cvijeceIds })
        : of([])
    }).subscribe(({ artikli, cvijece }) => {
      console.log('🎯 Backend odgovori:');
      console.log('  Artikli:', artikli);
      console.log('  Cvijeće:', cvijece);

      const artikliWithType: CartItem[] = artikli.map(a => ({ ...a, type: 'artikl' as const }));
      const cvijeceWithType: CartItem[] = cvijece.map(f => ({ ...f, type: 'cvijet' as const }));

      this.itemsWithDetails = [...artikliWithType, ...cvijeceWithType];
      this.total = this.cartService.getTotal(this.itemsWithDetails);
      this.isLoaded = true;

      console.log('🧾 itemsWithDetails:', this.itemsWithDetails);
    });
  }

  removeItem(index: number) {
    const item = this.itemsWithDetails[index];

    if (!item || !item.type) return;

    this.cartService.removeItem(index, item.type);
    this.ngOnInit();
  }

  pay() {
    this.http
      .post('http://localhost:3000/api/payment/create-checkout-session', {
        items: this.itemsWithDetails
      })
      .subscribe((res: any) => {
        if (res?.url) {
          window.location.href = res.url;
        }
      });
  }
}
