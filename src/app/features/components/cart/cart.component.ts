import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { FlowerModel } from '../../models/flower.model';
import { forkJoin, of } from 'rxjs';
import { PogrebniArtikl } from '../../models/pogrebni-artikli.model';
import { ConfirmationService } from 'primeng/api';

type CartItem =
  | (PogrebniArtikl & { type: 'artikl'; quantity: number })
  | (FlowerModel & { type: 'cvijet'; quantity: number });

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  itemsWithDetails: CartItem[] = [];
  total = 0;
  isLoaded = false;

  constructor(
    private cartService: CartService, 
    private http: HttpClient,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.cartService.getCartItems().subscribe(items => {
      const artikliMap = new Map(items.filter(i => i.type === 'artikl').map(i => [i.itemId, i.quantity]));
      const cvijeceMap = new Map(items.filter(i => i.type === 'cvijet').map(i => [i.itemId, i.quantity]));
  
      const artikliIds = Array.from(artikliMap.keys());
      const cvijeceIds = Array.from(cvijeceMap.keys());
  
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
          ? this.http.post<FlowerModel[]>('http://localhost:3000/api/flowers/batch', { ids: cvijeceIds })
          : of([])
      }).subscribe(({ artikli, cvijece }) => {
        const artikliWithType: CartItem[] = artikli.map(a => ({
          ...a,
          type: 'artikl' as const,
          quantity: artikliMap.get(a.id) || 0
        }));
  
        const cvijeceWithType: CartItem[] = cvijece.map(f => ({
          ...f,
          type: 'cvijet' as const,
          quantity: cvijeceMap.get(f.id) || 0
        }));
  
        this.itemsWithDetails = [...artikliWithType, ...cvijeceWithType];
        this.total = this.cartService.getTotal(this.itemsWithDetails);
        this.isLoaded = true;
      });
    });
  }

  removeItem(index: number) {
    const item = this.itemsWithDetails[index];
    if (!item) return;

    this.cartService.removeItem(item.id, item.type);
    this.ngOnInit();
  }

  changeQuantity(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty >= 1 && newQty <= item.stock) {
      this.cartService.updateQuantity(item.type, item.id, newQty);
      item.quantity = newQty;
      this.total = this.cartService.getTotal(this.itemsWithDetails);
    }
  }
  

  pay() {
    const invalid = this.itemsWithDetails.find(item => item.quantity > item.stock);
    if (invalid) {
      alert(`Nema dovoljno zaliha za "${invalid.name}".`);
      return;
    }

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

  clearAll() {
    this.confirmationService.confirm({
      message: 'Jeste li sigurni da želite isprazniti cijelu košaricu?',
      header: 'Potvrda',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da',
      rejectLabel: 'Ne',
      accept: () => {
        this.cartService.clearCart();
        this.ngOnInit();
      }
    });
  }
}
