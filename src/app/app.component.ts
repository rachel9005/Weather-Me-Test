import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from './core/services/loader.service';
import { WeatherService } from './core/services/weather.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit ,OnDestroy{ 
   private destroy$ = new Subject<void>();

  displayLoading = false;
  isDarkTheme = false;

  constructor(private loaderService: LoaderService, private weatherService: WeatherService) { }

  ngOnInit() {
    this.loaderService.stateChange.pipe(takeUntil(this.destroy$)).subscribe((loaderState) => {
      setTimeout(() => {
        this.displayLoading = loaderState;
      });
    });
  }

  changeTemperatureUnit() {
    this.weatherService.isMetric = !this.weatherService.isMetric;

    this.weatherService.temperatureUnitChanged.next(null);
  }

  ngOnDestroy() {
    this.destroy$.next();  
    this.destroy$.complete(); 
  }
}
