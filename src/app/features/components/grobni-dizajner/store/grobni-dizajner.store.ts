import { Injectable, signal, computed } from '@angular/core';
import { StoneMaterial } from '../../../models/stone-material.model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class GrobniDizajnerStore {

  static readonly SCALE = 1.5;
  static readonly MIN_DEBLJINA = 0.02;
  static readonly MAX_DEBLJINA = 0.06; 
  static readonly MIN_VISINA = 0.10;
  static readonly MAX_VISINA = 0.20; 
  static readonly MAX_NAGIB = 0.15;
  static readonly MIN_NAGIB = 0.0;

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
    return this.http.post<{ textureUrl: string }>(`${environment.apiUrl}/api/upload/upload-texture`, formData);
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path}`;
  }

  izracunajPovrsinu(grobnicaGroup: THREE.Group, scale: number): number {
    let ukupnaPovrsina = 0;

    const izracunaj = (mesh: THREE.Mesh): number => {
      const geometry = mesh.geometry;
      if (!geometry || !(geometry instanceof THREE.BufferGeometry)) return 0;
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (!box) return 0;

      const širina = (box.max.x - box.min.x) / scale;
      const visina = (box.max.y - box.min.y) / scale;
      const dubina = (box.max.z - box.min.z) / scale;
      return 2 * (širina * visina + širina * dubina + visina * dubina);
    };

    grobnicaGroup.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        ukupnaPovrsina += izracunaj(obj);
      }
    });

    return +ukupnaPovrsina.toFixed(2);
  }


}
