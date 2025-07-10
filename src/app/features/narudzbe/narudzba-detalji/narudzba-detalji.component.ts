import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NarudzbeStore } from '../store/narudzbe.store';
import { OrderModel } from '../../models/order.model';
import { OrderStatus } from '../../models/order-status.enum';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-narudzba-detalji',
  templateUrl: './narudzba-detalji.component.html',
  styleUrls: ['./narudzba-detalji.component.css'],
  providers: [NarudzbeStore]
})
export class NarudzbaDetaljiComponent implements OnInit {
  narudzba: OrderModel | null = null;
  loading = true;
  statusOptions = [
    { label: 'Na čekanju', value: 'pending' },
    { label: 'Riješeno', value: 'resolved' },
    { label: 'Odbijeno', value: 'rejected' },
  ];

  constructor(
    private route: ActivatedRoute,
    private store: NarudzbeStore,
    private router: Router,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (isNaN(id)) {
      this.showWarningAndRedirect('Neispravan ID narudžbe.');
      return;
    }

    this.store.dohvatiDetalje(id).subscribe({
      next: (n) => {
        this.narudzba = n;
        this.loading = false;
      },
      error: () => {
        this.showWarningAndRedirect('Narudžba nije pronađena.');
      }
    });
  }

  promijeniStatus(status: OrderStatus) {
    if (!this.narudzba) return;

    this.store.promijeniStatus(this.narudzba.id, status);
    this.narudzba.status = status;
  }

  nazadNaPopis() {
    this.router.navigate(['/narudzbe']);
  }

  private showWarningAndRedirect(message: string) {
    this.toast.add({
      severity: 'warn',
      summary: 'Greška',
      detail: message,
    });

    setTimeout(() => {
      this.router.navigate(['/narudzbe']);
    }, 1500);
  }
}
