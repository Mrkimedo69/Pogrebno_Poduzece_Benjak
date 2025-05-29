import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MenubarModule,
    CardModule,
    ButtonModule,

  ],
  exports:[
    MenubarModule,
    CardModule,
    ButtonModule,

  ]
})
export class SharedModule { }
