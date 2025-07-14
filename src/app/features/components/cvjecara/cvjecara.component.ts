import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartStore } from '../../components/cart/store/cart.store';
import { AuthStore } from '../../../core/store/auth.store';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { FlowerModel } from '../../models/flower.model';
import { CvjecaraStore } from './store/cvjecara.store';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-cvjecara',
  templateUrl: './cvjecara.component.html',
  styleUrls: ['./cvjecara.component.css']
})
export class CvjecaraComponent implements OnInit {
  flowers: FlowerModel[] = [];
  prikazanoCvijece: FlowerModel[] = [];
  selectedFlower: FlowerModel | null = null;
  modalOpen = false;
  stavkiPoStranici = 6;
  isAdmin = this.authStore.isAdmin();
  isLoading = false;

  constructor(
    private store: CvjecaraStore,
    private cartStore: CartStore,
    private authStore: AuthStore,
    private notificationService: NotificationComponent,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.store.fetchAll().subscribe(() => {
      this.flowers = this.store.flowers();
      this.prikazanoCvijece = this.flowers.slice(0, this.stavkiPoStranici);
      this.isLoading = false;
    });
    
  }

  promijeniStranicu(event: any) {
    const start = event.first;
    const end = start + event.rows;
    this.prikazanoCvijece = this.flowers.slice(start, end);
  }

  naruci(flower: FlowerModel) {
    this.cartStore.addItem({
      id: flower.id,
      name: flower.name,
      price: flower.price,
      stock: flower.stock,
      quantity: 1,
      category:'cvijet'
    });

    this.notificationService.showSuccess('Dodano!', `${flower.name} je dodan u košaricu.`);
  }

  getItemQuantity(id: number): number {
    return this.cartStore.cvijetQuantities()[id] ?? 0;
  }

  onAddNew() {
    this.selectedFlower = null;
    this.modalOpen = true;
  }

  onEdit(flower: FlowerModel) {
    this.selectedFlower = { ...flower };
    this.modalOpen = true;
  }
  

  onDelete(id: number) {
    this.isLoading = true;
    this.confirmationService.confirm({
      message: 'Jeste li sigurni da želite obrisati ovaj cvijet?',
      header: 'Potvrda brisanja',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da',
      rejectLabel: 'Ne',
      accept: () => {
        this.store.delete(id).subscribe(() => {
          this.store.fetchAll().subscribe(() => {
            this.flowers = this.store.flowers();
            this.prikazanoCvijece = this.flowers.slice(0, this.stavkiPoStranici);
            this.isLoading = false;
          });
        });
      },
      reject: () => {
        this.isLoading = false;
      }
    });
  }

  closeModal(potrebanRefresh: boolean) {
    if (potrebanRefresh) {
      this.isLoading = true;
      this.store.fetchAll().subscribe(() => {
        this.flowers = this.store.flowers();
        this.prikazanoCvijece = this.flowers.slice(0, this.stavkiPoStranici);
        this.isLoading = false;
      });
    }

    this.modalOpen = false;
    this.selectedFlower = null;
  }
  
}
