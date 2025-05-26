import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ToolbarModule,
    ButtonModule
  ],
  exports:[
    HeaderComponent,
    ButtonModule
  ]
})
export class CoreModule { }
