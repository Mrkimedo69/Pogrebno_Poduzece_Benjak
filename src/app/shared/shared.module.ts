import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MenubarModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    SelectButtonModule,
    FormsModule,
  ],
  exports:[
    MenubarModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    SelectButtonModule,
    FormsModule,
  ]
})
export class SharedModule { }
