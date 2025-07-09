import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './features/components/homepage/homepage.component';
import { CvjecaraComponent } from './features/components/cvjecara/cvjecara.component';
import { PogrebniArtikliComponent } from './features/components/pogrebni-artikli/pogrebni-artikli.component';
import { GrobniDizajnerComponent } from './features/components/grobni-dizajner/grobni-dizajner.component';
import { KontaktComponent } from './features/components/kontakt/kontakt.component';
import { AuthComponent } from './core/components/header/auth/auth/auth.component';
import { CartComponent } from './features/components/cart/cart.component';
import { AdminGuard } from './core/guard/auth.guard';
import { AdminArtiklFormComponent } from './features/components/pogrebni-artikli/admin-artikl-form/admin-artikl-form.component';

const routes: Routes = [
    {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  { path: '', 
    component: HomepageComponent 
  },
  { path: 'cvjecara', 
    component: CvjecaraComponent 
  },
  { path: 'pogrebni_artikli', 
    component: PogrebniArtikliComponent 
  },
  { path: 'grobni_dizajner', 
    component: GrobniDizajnerComponent 
  },
  { path: 'kontakt', 
    component: KontaktComponent },
  { path: 'auth', 
    component: AuthComponent },
  { path: 'kosarica', 
    component: CartComponent },
  {
    path: 'admin-panel',
    component: AdminArtiklFormComponent,
    canActivate: [AdminGuard]
  }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
