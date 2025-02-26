import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchPage } from './weather/weather/pages/search/search.page';


const routes: Routes = [
  {
    path: 'search',
    component: SearchPage,
  },
  {
    path: 'search/:locationKey', 
    component: SearchPage,
  },
  { path: '', redirectTo: 'search', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
