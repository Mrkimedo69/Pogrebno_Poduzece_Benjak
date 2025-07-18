import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { OrderModel } from '../../models/order.model';
import { OrderStatus } from '../../models/order-status.enum';
import { ArchivedOrderModel } from '../../models/archived-order.model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable()
export class NarudzbeStore {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(MessageService);

  private readonly _aktivneNarudzbe = signal<OrderModel[]>([]);
  readonly aktivneNarudzbe = this._aktivneNarudzbe.asReadonly();

  private readonly _arhiviraneNarudzbe = signal<ArchivedOrderModel[]>([]);
  readonly arhiviraneNarudzbe = this._arhiviraneNarudzbe.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  ucitajAktivneNarudzbe(): void {
    this._loading.set(true);
    this.http.get<OrderModel[]>(`${environment.apiUrl}/api/orders?status=pending`).subscribe({
      next: (data) => {
        this._aktivneNarudzbe.set(data);
        this.toast.add({ severity: 'success', summary: 'Učitano', detail: 'Aktivne narudžbe učitane' });
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Greška', detail: 'Neuspješno učitavanje aktivnih narudžbi' });
      },
      complete: () => this._loading.set(false),
    });
  }

  ucitajArhiviraneNarudzbe(): void {
    this._loading.set(true);
    this.http.get<ArchivedOrderModel[]>(`${environment.apiUrl}/api/orders/archived`).subscribe({
      next: (data) => {
        this._arhiviraneNarudzbe.set(data);
        this.toast.add({ severity: 'success', summary: 'Učitano', detail: 'Arhiva učitana' });
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Greška', detail: 'Neuspješno učitavanje arhive' });
      },
      complete: () => this._loading.set(false),
    });
  }

  promijeniStatus(id: number, noviStatus: OrderStatus): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/api/orders/${id}/status`, { status: noviStatus }).pipe(
      tap(() => {
        const novaLista = this._aktivneNarudzbe().filter((n) => n.id !== id);
        this._aktivneNarudzbe.set(novaLista);
        this.toast.add({ severity: 'success', summary: 'Status promijenjen' });
      })
    );
  }

  dohvatiNarudzbuPoId(id: number): Observable<OrderModel> {
    return this.http.get<OrderModel>(`${environment.apiUrl}/api/orders/${id}`);
  }
}
