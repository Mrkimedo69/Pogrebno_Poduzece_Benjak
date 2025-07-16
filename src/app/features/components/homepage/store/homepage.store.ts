import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HomepageStore {
  // Rezervirano za buduce: npr. pozdrav, poruka dana, featured usluge, itd.
  private readonly _featuredMessage = signal<string>('Dobro došli u Pogrebno poduzeće Benjak.');
  readonly featuredMessage = this._featuredMessage;

  setFeaturedMessage(message: string) {
    this._featuredMessage.set(message);
  }

  resetMessage() {
    this._featuredMessage.set('Dobro došli u Pogrebno poduzeće Benjak.');
  }
}
