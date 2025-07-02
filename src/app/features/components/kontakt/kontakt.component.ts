import { Component } from '@angular/core';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-kontakt',
  templateUrl: './kontakt.component.html',
  styleUrls: ['./kontakt.component.css']
})
export class KontaktComponent {
  ime: string = '';
  email: string = '';
  poruka: string = '';

  posaljiPoruku() {
    if (!this.ime || !this.email || !this.poruka) {
      alert('Molimo ispunite sva polja.');
      return;
    }

    const templateParams = {
      from_name: this.ime,
      from_email: this.email,
      message: this.poruka
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY')
      .then((response) => {
        console.log('Email poslan!', response.status, response.text);
        alert('Hvala na poruci! Javit ćemo vam se uskoro.');
        this.ime = '';
        this.email = '';
        this.poruka = '';
      }, (err) => {
        console.error('Greška pri slanju', err);
        alert('Došlo je do greške. Pokušajte kasnije.');
      });
  }
}
