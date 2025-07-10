import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { OrderModel } from '../../models/order.model';
import { OrderStatus } from '../../models/order-status.enum';
import { ArchivedOrderModel } from '../../models/archived-order.model';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class NarudzbeStore {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(MessageService);

  private readonly _narudzbe = signal<OrderModel[]>([]);
  readonly narudzbe = this._narudzbe.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  ucitajNarudzbe() {
    this._loading.set(true);
    this.http.get<OrderModel[]>('http://localhost:3000/api/orders').subscribe({
      next: (data) => {
        this._narudzbe.set(data);
        this.toast.add({ severity: 'success', summary: 'Učitano', detail: 'Narudžbe učitane' });
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Greška', detail: 'Nije moguće učitati narudžbe' });
      },
      complete: () => this._loading.set(false),
    });
  }

  promijeniStatus(id: number, noviStatus: OrderStatus) {
    this.http.patch(`http://localhost:3000/api/orders/${id}/status`, { status: noviStatus }).subscribe({
      next: () => {
        const novaLista = this._narudzbe().map((n) =>
          n.id === id ? { ...n, status: noviStatus } : n
        );
        this._narudzbe.set(novaLista);
        this.toast.add({ severity: 'success', summary: 'Uspješno', detail: 'Status promijenjen' });
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Greška', detail: 'Promjena statusa nije uspjela' });
      },
    });
  }

  dohvatiDetalje(id: number) {
    return this.http.get<OrderModel>(`http://localhost:3000/api/orders/${id}`);
  }
  
  private readonly _arhiva = signal<ArchivedOrderModel[]>([]);
  readonly arhiva = this._arhiva.asReadonly();

  ucitajArhivu(): Observable<ArchivedOrderModel[]> {
    this._loading.set(true);
  
    return this.http.get<ArchivedOrderModel[]>('http://localhost:3000/api/orders/archived').pipe(
      tap((data) => {
        this._arhiva.set(data);
        this.toast.add({ severity: 'success', summary: 'Učitano', detail: 'Arhiva učitana' });
        this._loading.set(false);
      }),
      catchError((error) => {
        this.toast.add({ severity: 'error', summary: 'Greška', detail: 'Greška kod učitavanja arhive' });
        this._loading.set(false);
        return throwError(() => error);
      })
    );
  }
  
}
