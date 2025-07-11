import { Component, effect, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartStore } from '../../components/cart/store/cart.store';
import { AuthStore } from '../../../core/store/auth.store';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { PogrebniArtikl } from '../../models/pogrebni-artikli.model';
import { ArtikliStore } from './store/pogrebni-artikli.store';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-pogrebni-artikli',
  templateUrl: './pogrebni-artikli.component.html',
  styleUrls: ['./pogrebni-artikli.component.css']
})
export class PogrebniArtikliComponent implements OnInit {

  constructor(
    public artikliStore: ArtikliStore,
    private cartStore: CartStore,
    private authStore: AuthStore,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationComponent,
  ) {}

  itemsPerPage = 10;
  currentPage = 1;
  isAdmin = this.authStore.isAdmin();

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
    const allItems = this.artikli || [];
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return allItems.slice(start, start + this.itemsPerPage);
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
      category: 'artikl'
    });

    this.notificationService.showSuccess('Dodano!', `${item.name} je dodan u košaricu.`);
  }

  getItemQuantity(id: number): number {
    return this.cartStore.artiklQuantities()[id] ?? 0;
  }

  modalOpen = false;
  selectedArtikl: PogrebniArtikl | null = null;

  onAddNew() {
    this.selectedArtikl = null;
    this.modalOpen = true;
  }

  onEdit(item: PogrebniArtikl) {
    this.selectedArtikl = { ...item };
    this.modalOpen = true;
  }

  onDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Jeste li sigurni da želite obrisati ovaj artikl?',
      header: 'Potvrda brisanja',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da',
      rejectLabel: 'Ne',
      accept: () => {
        this.artikliStore.delete(id).subscribe(() => {
          this.artikliStore.fetchAll();
          this.notificationService.showSuccess('Obrisano', 'Artikl je uspješno obrisan.');
        });
      }
    });
  }
  
  closeModal(potrebanRefresh: boolean) {
    this.modalOpen = false;
    this.selectedArtikl = null;
  
    if (potrebanRefresh) {
      this.artikliStore.fetchAll();
    }
  
}
}
