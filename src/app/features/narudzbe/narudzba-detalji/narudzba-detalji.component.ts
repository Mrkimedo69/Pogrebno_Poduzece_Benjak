import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NarudzbeStore } from '../store/narudzbe.store';
import { OrderModel } from '../../models/order.model';
import { OrderStatus } from '../../models/order-status.enum';
import { ConfirmationService, MessageService } from 'primeng/api';

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
    private toast: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (isNaN(id)) {
      this.showWarningAndRedirect('Neispravan ID narudžbe.');
      return;
    }

    this.store.dohvatiNarudzbuPoId(id).subscribe({
      next: (n) => {
        this.narudzba = n;
        this.loading = false;
      },
      error: () => {
        this.showWarningAndRedirect('Narudžba nije pronađena.');
      }
    });
  }

  postaviStatus(noviStatus: OrderStatus) {
    if (!this.narudzba) return;

    if (noviStatus === 'resolved') {
      this.confirmationService.confirm({
        message: 'Jeste li sigurni da je sve napravljeno?',
        header: 'Potvrda',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Da',
        rejectLabel: 'Ne',
        accept: () => {
          this.promijeniStatus(noviStatus);
        }
      });
    } else {
      this.promijeniStatus(noviStatus);
    }
  }

  private promijeniStatus(noviStatus: OrderStatus) {
    this.store.promijeniStatus(this.narudzba!.id, noviStatus).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Status ažuriran' });
        this.router.navigate(['/narudzbe']);
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Greška', detail: 'Neuspješno ažuriranje statusa' });
      }
    });
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
