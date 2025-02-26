import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { WeatherService } from 'src/app/core/services/weather.service';
import { CurrentWeather } from 'src/app/shared/models/currentWeather.model';
import { DailyForecast } from 'src/app/shared/models/forecast.model';
import { Location } from 'src/app/shared/models/location.model';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss',
  standalone: false
})
export class WeatherComponent implements OnInit, OnDestroy {
  currentWeatherDisplay: { value: Number; unit: string; };
  forecastDisplay: DailyForecast[] = [];
  private destroy$ = new Subject<void>();
  _currentWeather: CurrentWeather = undefined;
  _forecast: DailyForecast[] = [];

  @Input() clothingRecommendation: string = '';
  @Input() isFavorite = false;
  @Input() selectedCity: Location = undefined;

  @Input()
  set currentWeather(value: CurrentWeather | undefined) {
    this._currentWeather = value;
    this.updateTemperatureDisplay();
  }
  get currentWeather(): CurrentWeather | undefined {
    return this._currentWeather;
  }

  @Input()
  set forecast(value: DailyForecast[]) {
    this._forecast = value || [];
    this.convertForecastUnits();
  }
  get forecast(): DailyForecast[] {
    return this._forecast;
  }

  constructor(private weatherService: WeatherService) { }
  ngOnInit(): void {
    this.onTemperatureUnitChanged();
  }

  private onTemperatureUnitChanged() {
    this.weatherService.temperatureUnitChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateTemperatureDisplay();
      this.convertForecastUnits();
    });
  }

  // Update temperature display based on unit (metric or imperial)
  private updateTemperatureDisplay() {
    if (this.currentWeather) {
      this.currentWeatherDisplay = {
        value: this.weatherService.isMetric ? this.currentWeather.Temperature.Metric.Value : this.currentWeather.Temperature.Imperial.Value,
        unit: this.weatherService.isMetric ? this.currentWeather.Temperature.Metric.Unit : this.currentWeather.Temperature.Imperial.Unit
      };
    }
  }
  // Convert forecast data to the selected temperature unit
  private convertForecastUnits() {
    if (this.forecast) {
      this.forecastDisplay = this.forecast.map(day => {
        let minTemp = Number(day.Temperature.Minimum.Value);
        let maxTemp = Number(day.Temperature.Maximum.Value);
        if (!this.weatherService.isMetric) {
          minTemp = (minTemp * 1.8) + 32;
          maxTemp = (maxTemp * 1.8) + 32;
        } else {
          minTemp = Math.round((minTemp - 32) / 1.8);
          maxTemp = Math.round((maxTemp - 32) / 1.8);
        }
        return {
          ...day,
          Temperature: {
            Minimum: {
              Value: minTemp,
              Unit: this.weatherService.isMetric ? 'C' : 'F',
              UnitType: this.weatherService.isMetric ? 17 : 18
            },
            Maximum: {
              Value: maxTemp,
              Unit: this.weatherService.isMetric ? 'C' : 'F',
              UnitType: this.weatherService.isMetric ? 17 : 18
            }
          }
        };
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
