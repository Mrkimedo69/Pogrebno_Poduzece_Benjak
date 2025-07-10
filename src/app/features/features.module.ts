import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HomepageComponent } from './components/homepage/homepage.component';
import { CvjecaraComponent } from './components/cvjecara/cvjecara.component';
import { PogrebniArtikliComponent } from './components/pogrebni-artikli/pogrebni-artikli.component';
import { GrobniDizajnerComponent } from './components/grobni-dizajner/grobni-dizajner.component';
import { KontaktComponent } from './components/kontakt/kontakt.component';
import { CartComponent } from './components/cart/cart.component';
import { AdminArtiklFormComponent } from './components/pogrebni-artikli/admin-artikl-form/admin-artikl-form.component';
import { AdminFlowerFormComponent } from './components/cvjecara/admin-flower-form/admin-flower-form.component';
import { NarudzbeComponent } from './narudzbe/narudzbe.component';
import { NarudzbaDetaljiComponent } from './narudzbe/narudzba-detalji/narudzba-detalji.component';



@NgModule({
  declarations: [
    HomepageComponent,
    CvjecaraComponent,
    PogrebniArtikliComponent,
    GrobniDizajnerComponent,
    KontaktComponent,
    CartComponent,
    AdminArtiklFormComponent,
    AdminFlowerFormComponent,
    NarudzbeComponent,
    NarudzbaDetaljiComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,

  ]
})
export class FeaturesModule { }
