import { inject, Injectable, signal } from '@angular/core';
import emailjs from 'emailjs-com';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class KontaktStore {
  private readonly toast = inject(MessageService);
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
        this.toast.add({ severity: 'success', summary: 'Učitano', detail: 'Uspješno poslana poruka.' });
      })
      .catch((err) => {
        console.error('Greška pri slanju firmi:', err);
        this.toast.add({ severity: 'error', summary: 'Greška', detail: 'Došlo je do greške. Pokušajte kasnije.' });
      })
      .finally(() => {
        this.loading.set(false);
      });

    }
}
