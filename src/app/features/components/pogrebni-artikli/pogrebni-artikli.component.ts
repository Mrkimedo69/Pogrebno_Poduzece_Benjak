import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-pogrebni-artikli',
  templateUrl: './pogrebni-artikli.component.html',
  styleUrls: ['./pogrebni-artikli.component.css']
})
export class PogrebniArtikliComponent {
  pogrebni_artikli: any[] = [];
  itemsPerPage = 10;
  currentPage = 1;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/artikli').subscribe(data => {
      this.pogrebni_artikli = data;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.pogrebni_artikli.length / this.itemsPerPage);
  }

  getCurrentItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.pogrebni_artikli.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
