import { Component } from '@angular/core';

@Component({
  selector: 'app-pogrebni-artikli',
  templateUrl: './pogrebni-artikli.component.html',
  styleUrl: './pogrebni-artikli.component.css'
})
export class PogrebniArtikliComponent {
    pogrebni_artikli = [
    {
      naziv: 'Grobna svijeća - klasična',
      cijena: 3,
      opis: 'Crvena klasična svijeća u plastičnom kućištu s poklopcem.',
      slika: 'assets/potrepstine/svijeca1.jpg'
    },
    {
      naziv: 'Lampaš s motivom križa',
      cijena: 8,
      opis: 'Stakleni lampaš s metalnim pokrovom i simbolom križa.',
      slika: 'assets/potrepstine/lampas1.jpg'
    },
    {
      naziv: 'Drveni križ s gravurom',
      cijena: 25,
      opis: 'Kvalitetan drveni križ s mogućnošću personalizirane gravure.',
      slika: 'assets/potrepstine/kriz1.jpg'
    }, 
    
  ];

}
