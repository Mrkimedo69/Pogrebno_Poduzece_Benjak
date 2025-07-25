import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from '../shared/shared.module';
import { MenubarModule } from 'primeng/menubar';
import { AuthComponent } from './components/header/auth/auth/auth.component';

@NgModule({
  declarations: [
    HeaderComponent,
    AuthComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ToolbarModule,
    ButtonModule,
    MenubarModule,
  ],
  exports:[
    HeaderComponent,
    ButtonModule
  ]
})
export class CoreModule { }
