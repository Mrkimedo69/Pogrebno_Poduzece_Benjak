import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Početna',
        icon: 'pi pi-home',
        routerLink: '/'
      },
      {
        label: 'Cvjećara',
        icon: 'pi pi-sun',
        routerLink: '/cvjecara'
      },
      {
        label: 'Potrepštine',
        icon: 'pi pi-box',
        routerLink: '/potrepstine'
      },
      {
        label: 'Dizajner groba',
        icon: 'pi pi-cog',
        routerLink: '/dizajner'
      }
    ];
  }
}
