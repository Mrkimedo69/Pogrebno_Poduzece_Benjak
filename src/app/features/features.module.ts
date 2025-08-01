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
import { ArhivaNarudzbiComponent } from './narudzbe/arhiva-narudzbi/arhiva-narudzbi.component';
import { OrderDialogComponent } from './components/cart/order-dialog/order-dialog.component';
import { UserOrderHistoryComponent } from './components/cart/user-order-history/user-order-history.component';
import { EmployeeMonumentRequestComponent } from './narudzbe/employee-monument-request/employee-monument-request.component';
import { NarudzbeStore } from './narudzbe/store/narudzbe.store';
import { MonumentRequestDialogComponent } from './components/grobni-dizajner/monument-request-dialog/monument-request-dialog.component';
import { AdminMaterialFormComponent } from './components/grobni-dizajner/admin-material-form/admin-material-form.component';

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
    ArhivaNarudzbiComponent,
    OrderDialogComponent,
    UserOrderHistoryComponent,
    EmployeeMonumentRequestComponent,
    MonumentRequestDialogComponent,
    AdminMaterialFormComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  providers: [
    NarudzbeStore
  ]
})
export class FeaturesModule { }
