import { Injectable, signal } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({ providedIn: 'root' })
export class KontaktStore {
  readonly ime = signal('');
  readonly email = signal('');
  readonly poruka = signal('');

  readonly loading = signal(false);

  reset() {
    this.ime.set('');
    this.email.set('');
    this.poruka.set('');
  }

  sendMessage(): void {
    if (!this.ime() || !this.email() || !this.poruka()) {
      alert('Molimo ispunite sva polja.');
      return;
    }

    this.loading.set(true);

    const templateParams = {
      from_name: this.ime(),
      from_email: this.email(),
      message: this.poruka()
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY')
      .then((response) => {
        console.log('Email poslan!', response.status, response.text);
        alert('Hvala na poruci! Javit ćemo vam se uskoro.');
        this.reset();
      }, (err) => {
        console.error('Greška pri slanju', err);
        alert('Došlo je do greške. Pokušajte kasnije.');
      })
      .finally(() => {
        this.loading.set(false);
      });
  }
}
