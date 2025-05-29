import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HomepageComponent } from './components/homepage/homepage.component';



@NgModule({
  declarations: [
    HomepageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,

  ]
})
export class FeaturesModule { }
