import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';

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
    PaginatorModule,
  ],
  exports:[
    MenubarModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    SelectButtonModule,
    FormsModule,
    PaginatorModule,
  ]
})
export class SharedModule { }
