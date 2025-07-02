import { Component } from '@angular/core';

@Component({
  selector: 'app-pogrebni-artikli',
  templateUrl: './pogrebni-artikli.component.html',
  styleUrls: ['./pogrebni-artikli.component.css']
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
    {
      naziv: 'Bijela svijeća s anđelom',
      cijena: 4,
      opis: 'Dekorativna svijeća s motivom anđela i zlatnim detaljima.',
      slika: 'assets/potrepstine/svijeca2.jpg'
    },
    {
      naziv: 'Lampaš rustikalni',
      cijena: 10,
      opis: 'Lampaš s rustikalnim izgledom i dugim trajanjem.',
      slika: 'assets/potrepstine/lampas2.jpg'
    }
  ];

  itemsPerPage = 10;
  currentPage = 1;

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
