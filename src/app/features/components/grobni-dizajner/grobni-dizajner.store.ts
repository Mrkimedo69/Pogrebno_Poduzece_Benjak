import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StoneMaterial } from '../../models/stone-material.model';

@Injectable({ providedIn: 'root' })
export class GrobniDizajnerStore {
  private readonly _materijali = signal<StoneMaterial[]>([]);
  readonly materijali = computed(() => this._materijali());

  private readonly _odabraniMaterijal = signal<StoneMaterial | null>(null);
  readonly odabraniMaterijal = computed(() => this._odabraniMaterijal());

  private readonly _odabraniOblik = signal<{ label: string; value: string; cijena: number }>({
    label: 'Klasični',
    value: 'klasicni',
    cijena: 100
  });
  readonly oblici = [
    { label: 'Klasični', value: 'klasicni', cijena: 100 },
    { label: 'Polukružni', value: 'polukruzni', cijena: 120 },
    { label: 'Moderni', value: 'moderni', cijena: 150 }
  ];
  readonly odabraniOblik = computed(() => this._odabraniOblik());

  constructor(private http: HttpClient) {}

  fetchMaterijali(): Observable<StoneMaterial[]> {
    return this.http.get<StoneMaterial[]>('http://localhost:3000/api/stone-materials')
      .pipe(tap(data => {
        this._materijali.set(data);
        this._odabraniMaterijal.set(data[0] || null);
      }));
  }

  setOdabraniMaterijal(m: StoneMaterial) {
    this._odabraniMaterijal.set(m);
  }

  setOdabraniOblik(oblik: { label: string; value: string; cijena: number }) {
    this._odabraniOblik.set(oblik);
  }

  readonly bojaMramora = computed(() => {
    switch (this._odabraniMaterijal()?.color) {
      case 'crni': return '#2c2c2c';
      case 'sivi': return '#888888';
      case 'bijeli': return '#e0e0e0';
      default: return '#cccccc';
    }
  });

  readonly cijena = computed(() => {
    const m = this._odabraniMaterijal()?.pricePerM3 || 0;
    const o = this._odabraniOblik()?.cijena || 0;
    return m + o;
  });

  readonly trenutniPrikaz = computed(() => {
    const mat = this._odabraniMaterijal()?.pricePerM3 ?? 'prazno';
    const obl = this._odabraniOblik()?.value ?? 'prazno';
    return `assets/dizajn/${mat}-${obl}.png`;
  });
}
