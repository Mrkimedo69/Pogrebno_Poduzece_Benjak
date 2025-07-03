import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cvjecara',
  templateUrl: './cvjecara.component.html',
  styleUrls: ['./cvjecara.component.css']
})
export class CvjecaraComponent implements OnInit {

  constructor(private http: HttpClient){}

  cvijece: any[] = [];
  prikazanoCvijece: any[] = [];
  stavkiPoStranici: number = 9;

  ngOnInit(): void {
    this.ucitajCvijece();
  }

  ucitajCvijece(): void {
    this.http.get<any[]>('http://localhost:3000/flowers').subscribe(data => {
      this.cvijece = data;
      this.promijeniStranicu({ first: 0 });
    });
  }

  promijeniStranicu(event: any): void {
    const start = event.first;
    const end = start + this.stavkiPoStranici;
    this.prikazanoCvijece = this.cvijece.slice(start, end);
  }
}
