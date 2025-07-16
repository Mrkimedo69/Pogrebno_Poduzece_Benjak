import { Component, computed } from '@angular/core';
import { HomepageStore } from './store/homepage.store';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  featuredMessage = computed(() => this.store.featuredMessage());

  constructor(private store: HomepageStore) {}
}
