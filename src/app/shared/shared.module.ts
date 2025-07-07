import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { NotificationComponent } from './components/notification/notification.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    NotificationComponent
  ],
  providers: [MessageService],
  imports: [
    CommonModule,
    MenubarModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    SelectButtonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    ToastModule,
  ],
  exports:[
    MenubarModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    SelectButtonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    ToastModule,
    NotificationComponent
  ]
})
export class SharedModule { }
