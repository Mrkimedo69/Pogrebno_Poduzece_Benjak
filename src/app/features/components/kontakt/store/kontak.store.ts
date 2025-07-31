import { Injectable, signal } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({ providedIn: 'root' })
export class KontaktStore {
  readonly ime = signal('');
  readonly email = signal('');
  readonly poruka = signal('');

  readonly loading = signal(false);
  b_email : string = 'tdmrkimedo69@gmail.com'

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
      message: this.poruka(),
      email: this.b_email
    };

    emailjs.send('service_q3qy93h', 'template_znx7sqs', templateParams, 'r8hrQX47rt6c6KvwV')
      .then(() => {
        const replyParams = {
          from_name: this.ime(),
          from_email: this.email(),
          email: this.b_email
        };

        emailjs.send('service_q3qy93h', 'template_eazbu4f', replyParams, 'r8hrQX47rt6c6KvwV')
          .then(() => {
            alert('Hvala na poruci! Javit ćemo vam se uskoro.');
            this.reset();
          })
          .catch((err) => {
            console.error('Greška pri slanju potvrde korisniku:', err);
          });
      })
      .catch((err) => {
        console.error('Greška pri slanju firmi:', err);
        alert('Došlo je do greške. Pokušajte kasnije.');
      })
      .finally(() => {
        this.loading.set(false);
      });

    }
}
