import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './features/components/homepage/homepage.component';
import { CvjecaraComponent } from './features/components/cvjecara/cvjecara.component';
import { PogrebniArtikliComponent } from './features/components/pogrebni-artikli/pogrebni-artikli.component';
import { GrobniDizajnerComponent } from './features/components/grobni-dizajner/grobni-dizajner.component';

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
