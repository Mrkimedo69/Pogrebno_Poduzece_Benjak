import { Component, OnInit, inject } from '@angular/core';
import { NarudzbeStore } from '../store/narudzbe.store';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { font as openSansFont } from '../../../../assets/fonts/OpenSans-Regular';



@Component({
  selector: 'app-arhiva-narudzbi',
  templateUrl: './arhiva-narudzbi.component.html',
  styleUrls: ['./arhiva-narudzbi.component.css'],
  providers: [NarudzbeStore]
})
export class ArhivaNarudzbiComponent implements OnInit {
  private store = inject(NarudzbeStore);
  arhiviraneNarudzbe = this.store.arhiviraneNarudzbe;
  loading = this.store.loading;
  error = false;
  selectedEmployee = '';
  selectedDate: Date | null = null;

  ngOnInit(): void {
    this.error = false;
    this.store.ucitajArhiviraneNarudzbe();
  }

  get filtriraneNarudzbe() {
    return this.arhiviraneNarudzbe().filter(n => {
      const byEmployee = this.selectedEmployee
        ? n.resolvedBy.toLowerCase().includes(this.selectedEmployee.toLowerCase())
        : true;

      const byDate = this.selectedDate
        ? new Date(n.archivedAt).toDateString() === this.selectedDate.toDateString()
        : true;

      return byEmployee && byDate;
    });
  }

  preuzmiJednuNarudzbuPDF(narudzba: any) {
    const doc = new jsPDF();
    doc.addFileToVFS('OpenSans-Regular.ttf', openSansFont);
    doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal');
    doc.setFont('OpenSans', 'normal');
  
    const marginLeft = 15;
    let y = 20;
  
    const img = new Image();
    img.src = 'assets/logo.png';
    img.onload = () => {
      doc.addImage(img, 'PNG', 160, 10, 30, 15);
  
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.text('Pogrebno poduzeće Benjak', marginLeft, y);
  
      doc.setFontSize(14);
      doc.setTextColor(70, 70, 70);
      doc.text(`Detalji narudžbe #${narudzba.originalOrderId}`, marginLeft, y + 10);
  
      y += 25;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Ime i prezime: ${narudzba.fullName}`, marginLeft, y);
      y += 8;
      doc.text(`Email: ${narudzba.email}`, marginLeft, y);
      y += 8;
      doc.text(`Zaposlenik: ${narudzba.resolvedBy}`, marginLeft, y);
      y += 8;
      doc.text(`Datum: ${new Date(narudzba.archivedAt).toLocaleString()}`, marginLeft, y);
      y += 8;
      doc.text(`Ukupna cijena: ${narudzba.totalPrice} €`, marginLeft, y);
      y += 15;
  
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 40);
      doc.text('Popis artikala:', marginLeft, y);
      y += 8;
  
      doc.setFontSize(11);
      doc.setFillColor(240, 240, 240);
      doc.rect(marginLeft, y - 5, 180, 8, 'F');
  
      doc.text('Naziv', marginLeft + 2, y);
      doc.text('Količina', marginLeft + 80, y);
      doc.text('Cijena', marginLeft + 130, y);
      y += 6;
  
      doc.setDrawColor(200);
      doc.line(marginLeft, y, 195, y);
      y += 4;
  
      narudzba.items.forEach((item: any) => {
        doc.text(item.name, marginLeft + 2, y);
        doc.text(`${item.quantity}`, marginLeft + 80, y);
        doc.text(`${item.price} €`, marginLeft + 130, y);
        y += 8;
  
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
  
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Hvala na korištenju naših usluga.', marginLeft, 285);
      doc.save(`Narudzba_#${narudzba.originalOrderId}_${narudzba.fullName}.pdf`);
    };
  }
  
}
