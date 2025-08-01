import { Injectable, signal, computed } from '@angular/core';
import { StoneMaterial } from '../../../models/stone-material.model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GrobniDizajnerStore {
  private readonly _materijali = signal<StoneMaterial[]>([]);
  readonly materijali = computed(() => this._materijali());

  private readonly _odabraniMaterijal = signal<StoneMaterial | null>(null);
  readonly odabraniMaterijal = computed(() => this._odabraniMaterijal());

  readonly oblici = [
    { label: 'Klasični luk', value: 'upright-arc', cijena: 120 },
    { label: 'Nadgrobni spomenik s nagnutom prednjom plohom', value: 'slant', cijena: 110 },
    { label: 'Uspravna ploča - serpentin oblik', value: 'serpentine', cijena: 130 }
  ];

  private readonly _odabraniOblik = signal(this.oblici[0]);

  readonly odabraniOblik = computed(() => this._odabraniOblik());

  constructor(private http: HttpClient) {}

  fetchMaterijali(): Observable<StoneMaterial[]> {
    return this.http.get<StoneMaterial[]>(`${environment.apiUrl}/api/stone-materials`)
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
    return this._odabraniMaterijal()?.colorHex ?? '#cccccc';
  });

  readonly teksturaMaterijala = computed(() => {
    const path = this._odabraniMaterijal()?.textureUrl;
    if (!path || path.trim() === '') return null;
    return path.startsWith('http') ? path : `${environment.apiUrl}${path}`;
  });


  readonly cijena = computed(() => {
    const m = this._odabraniMaterijal()?.pricePerM2 || 0;
    const o = this._odabraniOblik()?.cijena || 0;
    return m + o;
  });

  readonly trenutniPrikaz = computed(() => {
    const mat = this._odabraniMaterijal()?.pricePerM2 ?? 'prazno';
    const obl = this._odabraniOblik()?.value ?? 'prazno';
    return `assets/dizajn/${mat}-${obl}.png`;
  });

  posaljiZahtjevPonude(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/monument-request`, payload);
  }

  fetchAll(): Observable<StoneMaterial[]> {
    return this.http.get<StoneMaterial[]>(`${environment.apiUrl}/api/stone-materials/admin`)
      .pipe(tap(data => this._materijali.set(data)));
  }

  add(data: Partial<StoneMaterial>) {
    return this.http.post<StoneMaterial>(`${environment.apiUrl}/api/stone-materials`, data);
  }

  update(id: number, data: Partial<StoneMaterial>) {
    return this.http.put<StoneMaterial>(`${environment.apiUrl}/api/stone-materials/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/api/stone-materials/${id}`);
  }

  uploadTexture(file: File): Observable<{ textureUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ textureUrl: string }>(`${environment.apiUrl}/api/upload`, formData);
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path}`;
  }

}
