import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FlowerModel } from '../../../models/flower.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CvjecaraStore {
  private readonly _flowers = signal<FlowerModel[]>([]);
  readonly flowers = computed(() => this._flowers());

  constructor(private http: HttpClient) {}

  fetchAll(): Observable<FlowerModel[]> {
    return this.http.get<FlowerModel[]>('http://localhost:3000/api/flowers')
      .pipe(tap(data => this._flowers.set(data)));
  }

  getById(id: number): FlowerModel | undefined {
    return this._flowers().find(f => f.id === id);
  }

  clear() {
    this._flowers.set([]);
  }
  add(flower: Partial<FlowerModel>) {
    return this.http.post<FlowerModel>('http://localhost:3000/api/flowers', flower);
  }
  
  update(id: number, flower: Partial<FlowerModel>) {
    return this.http.put<FlowerModel>(`http://localhost:3000/api/flowers/${id}`, flower);
  }
  
  delete(id: number) {
    return this.http.delete(`http://localhost:3000/api/flowers/${id}`);
  }
  
}
