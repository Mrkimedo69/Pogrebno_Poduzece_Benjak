import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NarudzbeStore } from '../store/narudzbe.store';
import { OrderModel } from '../../models/order.model';
import { OrderStatus } from '../../models/order-status.enum';

@Component({
  selector: 'app-narudzba-detalji',
  templateUrl: './narudzba-detalji.component.html',
  styleUrls: ['./narudzba-detalji.component.css'],
  providers: [NarudzbeStore]
})
export class NarudzbaDetaljiComponent implements OnInit {
  narudzba: OrderModel | null = null;
  statusOptions = [
    { label: 'Na čekanju', value: 'pending' },
    { label: 'Riješeno', value: 'resolved' },
    { label: 'Odbijeno', value: 'rejected' },
  ];

  constructor(
    private route: ActivatedRoute,
    private store: NarudzbeStore,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.store.dohvatiDetalje(id).subscribe({
        next: (n) => this.narudzba = n,
        error: () => console.error('Greška kod dohvaćanja narudžbe')
      });
    }
  }

  promijeniStatus(status: OrderStatus) {
    if (this.narudzba) {
      this.store.promijeniStatus(this.narudzba.id, status);
      this.narudzba.status = status;
    }
  }
  nazadNaPopis() {
    this.router.navigate(['/narudzbe']);
  }
}
