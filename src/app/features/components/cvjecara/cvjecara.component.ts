import { Component } from '@angular/core';

@Component({
  selector: 'app-cvjecara',
  templateUrl: './cvjecara.component.html',
  styleUrl: './cvjecara.component.css'
})
export class CvjecaraComponent {

    cvijece = [
    {
      naziv: 'Klasični buket ruža',
      cijena: 25,
      opis: 'Crvene ruže s bijelim zelenilom, elegantno umotane.',
      slika: 'assets/cvijece/buket1.jpg'
    },
    {
      naziv: 'Bijeli aranžman',
      cijena: 30,
      opis: 'Mirisni ljiljani i bijele ruže za posljednji pozdrav.',
      slika: 'assets/cvijece/buket2.jpg'
    },
    {
      naziv: 'Vijenac u obliku srca',
      cijena: 55,
      opis: 'Emotivni aranžman u obliku srca od karanfila.',
      slika: 'assets/cvijece/buket3.jpg'
    }
  ];
}
