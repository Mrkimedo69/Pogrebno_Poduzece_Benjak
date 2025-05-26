import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';

import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    ToolbarModule,
    AvatarModule,
    AvatarGroupModule
  ],
  exports:[HeaderComponent]
})
export class CoreModule { }
