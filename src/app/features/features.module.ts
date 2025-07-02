import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HomepageComponent } from './components/homepage/homepage.component';
import { CvjecaraComponent } from './components/cvjecara/cvjecara.component';
import { PogrebniArtikliComponent } from './components/pogrebni-artikli/pogrebni-artikli.component';
import { GrobniDizajnerComponent } from './components/grobni-dizajner/grobni-dizajner.component';



@NgModule({
  declarations: [
    HomepageComponent,
    CvjecaraComponent,
    PogrebniArtikliComponent,
    GrobniDizajnerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,

  ]
})
export class FeaturesModule { }
