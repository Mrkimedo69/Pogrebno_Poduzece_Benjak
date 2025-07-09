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
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';

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
    TableModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
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
    TableModule,
    NotificationComponent,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
  ]
})
export class SharedModule { }
