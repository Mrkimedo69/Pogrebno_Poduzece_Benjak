import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cvjecara',
  templateUrl: './cvjecara.component.html',
  styleUrls: ['./cvjecara.component.css']
})
export class CvjecaraComponent implements OnInit {

  cvijece: any[] = [];              // Puna lista (backend kad bude gotov)
  prikazanoCvijece: any[] = [];     // Samo ono što se prikazuje na trenutnoj stranici
  stavkiPoStranici: number = 9;

  ngOnInit(): void {
    this.ucitajCvijece();           // Inicijalno punjenje podataka
  }

  ucitajCvijece(): void {
    // Zamijeniti s HTTP pozivom prema backendu kad bude spreman
    this.cvijece = [
      {
        naziv: 'Klasični buket ruža',
        cijena: 25,
        opis: 'Crvene ruže s bijelim zelenilom, elegantno umotane.',
        slika: 'assets/placeholder_flower.png'
      },
      {
        naziv: 'Bijeli aranžman',
        cijena: 30,
        opis: 'Mirisni ljiljani i bijele ruže za posljednji pozdrav.',
        slika: 'assets/placeholder_flower.png'
      },
      {
        naziv: 'Vijenac u obliku srca',
        cijena: 55,
        opis: 'Emotivni aranžman u obliku srca od karanfila.',
        slika: 'assets/placeholder_flower.png'
      },
      // Dodaj još lažnih podataka da testiraš paginaciju ako želiš
    ];

    this.promijeniStranicu({ first: 0 }); // Prikaži prvu stranicu
  }

  promijeniStranicu(event: any): void {
    const start = event.first;
    const end = start + this.stavkiPoStranici;
    this.prikazanoCvijece = this.cvijece.slice(start, end);
  }
}
