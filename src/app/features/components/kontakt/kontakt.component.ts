import { Component } from '@angular/core';
import { KontaktStore } from './store/kontak.store';
@Component({
  selector: 'app-kontakt',
  templateUrl: './kontakt.component.html',
  styleUrls: ['./kontakt.component.css']
})
export class KontaktComponent {
  constructor(public store: KontaktStore) {}

  get ime() {
    return this.store.ime();
  }

  set ime(value: string) {
    this.store.ime.set(value);
  }

  get email() {
    return this.store.email();
  }

  set email(value: string) {
    this.store.email.set(value);
  }

  get poruka() {
    return this.store.poruka();
  }

  set poruka(value: string) {
    this.store.poruka.set(value);
  }

  posaljiPoruku() {
    this.store.sendMessage();
  }
}

