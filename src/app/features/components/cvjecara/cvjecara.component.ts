import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.services';

@Component({
  selector: 'app-cvjecara',
  templateUrl: './cvjecara.component.html',
  styleUrls: ['./cvjecara.component.css']
})
export class CvjecaraComponent implements OnInit {

  constructor(private http: HttpClient, private authService: AuthService, private router: Router){}

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
  naruci(cvijet: any) {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/auth']);
      return;
    }
    console.log('Dodaj u košaricu:', cvijet);
  }
}
