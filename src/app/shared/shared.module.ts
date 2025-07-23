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
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CalendarModule } from 'primeng/calendar';
import { LoaderComponent } from './components/loader/loader.component';
import { SliderModule } from 'primeng/slider';

@NgModule({
  declarations: [
    NotificationComponent,
    LoaderComponent,
  ],
  providers: [
    MessageService, 
    ConfirmationService,
  ],
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
    BadgeModule,
    ProgressSpinnerModule,
    CalendarModule,
    SliderModule,
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
    BadgeModule,
    ProgressSpinnerModule,
    CalendarModule,
    LoaderComponent,
    SliderModule,
  ]
})
export class SharedModule { }
