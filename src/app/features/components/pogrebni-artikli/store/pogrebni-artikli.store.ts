import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PogrebniArtikl } from '../../../models/pogrebni-artikli.model';
import { AuthStore } from '../../../../core/store/auth.store';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ArtikliStore {

  private readonly _artikli = signal<PogrebniArtikl[]>([]);
  readonly artikli = computed(() => this._artikli());
  readonly isAdmin = computed(() => this.authStore.user()?.role === 'admin');

  constructor(private http: HttpClient, private authStore: AuthStore) {}

  fetchAll(): Observable<PogrebniArtikl[]> {
    return this.http.get<PogrebniArtikl[]>(`${environment.apiUrl}/artikli`)
      .pipe(tap(artikli => this._artikli.set(artikli)));
  }

  getById(id: number): PogrebniArtikl | undefined {
    return this._artikli().find(a => a.id === id);
  }

  clear() {
    this._artikli.set([]);
  }
  add(artikl: Partial<PogrebniArtikl>) {
    return this.http.post<PogrebniArtikl>(`${environment.apiUrl}/artikli`, artikl);
  }
  
  update(id: number, artikl: Partial<PogrebniArtikl>) {
    return this.http.put<PogrebniArtikl>(`${environment.apiUrl}/artikli/${id}`, artikl);
  }
  
  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/artikli/${id}`);
  }
}
