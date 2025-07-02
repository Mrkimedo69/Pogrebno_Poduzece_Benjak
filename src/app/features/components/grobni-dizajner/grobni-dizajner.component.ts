import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-grobni-dizajner',
  templateUrl: './grobni-dizajner.component.html',
  styleUrl: './grobni-dizajner.component.css'
})
export class GrobniDizajnerComponent {
  svgContent: SafeHtml | null = null;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.ucitajSVG('klasicni');
  }

  ucitajSVG(naziv: string) {
    this.http.get(`assets/spomenici/${naziv}.svg`, { responseType: 'text' })
      .subscribe(svg => {
        console.warn("boja svga")
        const obojani = svg.replace(/fill="[^"]*"/g, `fill="${this.bojaMramora}"`);
        console.warn('SVG sadržaj nakon obrade:', obojani);
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(obojani);
      });
  }

  materijali = [
    { label: 'Crni mramor', value: 'crni', cijena: 200 },
    { label: 'Sivi granit', value: 'sivi', cijena: 180 },
    { label: 'Bijeli kamen', value: 'bijeli', cijena: 160 }
  ];

oblici = [
  { label: 'Klasični', value: 'klasicni', cijena: 100 },
  { label: 'Polukružni', value: 'polukruzni', cijena: 120 },
  { label: 'Moderni', value: 'moderni', cijena: 150 }
];

odabraniOblik = this.oblici[0];

get svgPutanja(): string {
  return this.odabraniOblik
    ? `assets/spomenici/${this.odabraniOblik.value}.svg`
    : '';
}

  odabraniMaterijal: any = null;

  izracunajCijenu(): number {
    const m = this.odabraniMaterijal?.cijena || 0;
    const o = this.odabraniOblik?.cijena || 0;
    return m + o;
  }

  trenutniPrikaz(): string {
    const mat = this.odabraniMaterijal?.value || 'prazno';
    const obl = this.odabraniOblik?.value || 'prazno';
    return `assets/dizajn/${mat}-${obl}.png`;
  }
  onPromjenaMaterijala() {
  if (this.odabraniOblik) {
    this.ucitajSVG(this.odabraniOblik.value);
    console.warn("hey", this.bojaMramora);
  }
}
  get bojaMramora(): string {
  switch (this.odabraniMaterijal?.value) {
    case 'crni':
      return '#2c2c2c';
    case 'sivi':
      return '#888';
    case 'bijeli':
      return '#e0e0e0';
    default:
      return '#cccccc';
  }
}
}
