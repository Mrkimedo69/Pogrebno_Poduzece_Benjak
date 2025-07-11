import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OrderStatus } from '../models/order-status.enum';
import { NarudzbeStore } from './store/narudzbe.store';

@Component({
  selector: 'app-narudzbe',
  templateUrl: './narudzbe.component.html',
  providers: [NarudzbeStore],
})
export class NarudzbeComponent implements OnInit {
  store = inject(NarudzbeStore);
  narudzbe = this.store.aktivneNarudzbe;
  loading = this.store.loading;

  private router = inject(Router);

  statusOptions = [
    { label: 'Na čekanju', value: OrderStatus.PENDING },
    { label: 'Riješeno', value: OrderStatus.RESOLVED },
    { label: 'Odbijeno', value: OrderStatus.REJECTED },
  ];

  ngOnInit(): void {
    this.store.ucitajAktivneNarudzbe();
  }

  idiNaDetalje(id: number) {
    console.log('Kliknuto ID:', id);
    this.router.navigate(['/narudzbe', id]);
  }
  

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'info';
    }
  }
}
