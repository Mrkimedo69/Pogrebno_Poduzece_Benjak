import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PogrebniArtikl } from '../../../models/pogrebni-artikli.model';

@Injectable({ providedIn: 'root' })
export class ArtikliStore {
  private readonly _artikli = signal<PogrebniArtikl[]>([]);
  readonly artikli = computed(() => this._artikli());

  constructor(private http: HttpClient) {}

  fetchAll() {
    this.http.get<PogrebniArtikl[]>('http://localhost:3000/api/artikli')
      .subscribe(artikli => this._artikli.set(artikli));
  }

  getById(id: number): PogrebniArtikl | undefined {
    return this._artikli().find(a => a.id === id);
  }

  clear() {
    this._artikli.set([]);
  }
}
