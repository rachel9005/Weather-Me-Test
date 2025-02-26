import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SearchPage } from './pages/search/search.page';
import { WeatherRoutingModule } from './weather-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { WeatherComponent } from './pages/search/weather/weather.component';

@NgModule({
  declarations: [SearchPage, WeatherComponent],
  imports: [CommonModule, WeatherRoutingModule, SharedModule,],
  exports: [SearchPage]
})
export class WeatherModule { }
