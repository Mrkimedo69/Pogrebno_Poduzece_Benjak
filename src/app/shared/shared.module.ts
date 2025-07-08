import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NotificationComponent } from './components/notification/notification.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
  declarations: [
    NotificationComponent
  ],
  providers: [MessageService, ConfirmationService],
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
    ConfirmDialogModule,
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
    NotificationComponent,
    ConfirmDialogModule
  ]
})
export class SharedModule { }
