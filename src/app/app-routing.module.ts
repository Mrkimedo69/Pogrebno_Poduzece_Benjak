import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './features/components/homepage/homepage.component';

const routes: Routes = [
    {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  { path: '', 
    component: HomepageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
