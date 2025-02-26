import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, switchMap, tap, catchError, of, forkJoin, filter, startWith, Subject, takeUntil } from 'rxjs';
import { WeatherService } from 'src/app/core/services/weather.service';
import { LocationService } from 'src/app/core/services/location.service';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { CurrentWeather } from 'src/app/shared/models/currentWeather.model';
import { Location } from 'src/app/shared/models/location.model';
import { DailyForecast } from 'src/app/shared/models/forecast.model';
import { ToastService } from '../../../../core/services/toast.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ActivatedRoute } from '@angular/router';
import { OpenAIService } from 'src/app/core/services/openAI.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false
})
export class SearchPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  searchControl: FormControl;
  filteredCities: Location[] = [];
  currentWeather!: CurrentWeather | undefined;
  forecast: DailyForecast[] = [];
  isFavorite = false;
  isSearchError = false;
  selectedCity: Location = undefined;
  searchErrorMessage = "";
  isFirstLoad = true;
  clothingRecommendation: string = '';

  constructor(
    private route: ActivatedRoute,
    private weatherService: WeatherService,
    private locationService: LocationService,
    private favoritesService: FavoritesService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private openAIService: OpenAIService
  ) { }

  ngOnInit() {
    this.onLocationKeyChanged();
    this.initForm()
    this.checkIfFavorite();
  }

  private onLocationKeyChanged() {
    // Listen for city changes in the URL and load city weather if a key is present
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const locationKey = params.get('locationKey');
      if (locationKey) {
        this.loadCityFromUrl(locationKey);
      }
    });
  }
  private initForm() {
    // Trigger search based on input changes and perform autocomplete search
    this.searchControl = new FormControl('Tel Aviv', {
      validators: [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)],
    });
    this.searchControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        startWith("Tel Aviv"),
        debounceTime(1000),
        tap(value => {
          this.handleSearchInputChange(value);
          this.searchControl.markAsTouched();
        }), filter(value => this.isValidSearchInput(value)),
        switchMap(value => this.fetchAutocompleteResults(value)),
        tap(cities => {
          if (this.isFirstLoad) {
            this.isFirstLoad = false;
            this.selectTelAvivIfExists(cities);
          }
        })
      )
      .subscribe(cities => {
        this.filteredCities = cities ?? [];
      });
  }

  // Load city weather data based on location key from the URL
  private loadCityFromUrl(locationKey: string) {
    this.locationService.getLocationByKey(locationKey).pipe(takeUntil(this.destroy$)).subscribe(city => {
      if (city) {
        this.selectedCity = city;
        this.searchControl.setValue(city.LocalizedName, { emitEvent: false });
        this.loadWeatherData(city.Key);
      }
    });
  }

  // Handle input change and reset weather data if search is empty
  private handleSearchInputChange(value: Location) {
    // typeof value === 'object' &&
    if (value.Key) {
      this.selectedCity = value;
    }
    if (!value) {
      this.clearWeatherData();
    }
  }

  // Clear weather data when input is cleared
  private clearWeatherData() {
    this.currentWeather = undefined;
    this.selectedCity = undefined;
    this.isFavorite = false;
    this.filteredCities = [];
    this.forecast = []
  }

  // Validate the search input (only English letters)
  private isValidSearchInput(value: string): boolean {
    return value && value.length > 1 && this.searchControl.valid;
  }

  // Fetch autocomplete suggestions for cities
  private fetchAutocompleteResults(value: string) {
    return this.locationService.getAutocompleteLocation(value).pipe(
      catchError(error => {
        this.toastService.showError("Error fetching autocomplete data.");
        return of([]);
      })
    );
  }

  // Select "Tel Aviv" if it exists in the search results
  private selectTelAvivIfExists(cities: Location[]) {
    const telAviv = cities.find(city => city.LocalizedName === "Tel Aviv");
    if (telAviv) {
      this.onCitySelected({ option: { value: telAviv } });
    }
  }

  // Triggered when a city is selected from the autocomplete list
  onCitySelected(event: any) {
    this.selectedCity = event.option.value;
    if (this.selectedCity) {
      this.searchControl.setValue(this.selectedCity.LocalizedName, { emitEvent: false });
      this.loadWeatherData(this.selectedCity.Key);
      this.checkIfFavorite();
    }
  }

  // Load weather and forecast data for the selected city
  loadWeatherData(locationKey: string) {
    this.loaderService.addRequest(); //Show loader while data is being fetched

    forkJoin({
      currentWeather: this.weatherService.getCurrentWeather(locationKey).pipe(
        catchError(error => {
          this.toastService.showError("Failed to load current weather.");
          return of(undefined);
        })
      ),
      forecast: this.weatherService.getForecast(locationKey).pipe(
        catchError(error => {
          this.toastService.showError("Failed to load forecast.");
          return of(undefined);
        })
      )
    }).subscribe(({ currentWeather, forecast }) => {
      if (!currentWeather || !Array.isArray(currentWeather) || currentWeather.length === 0) {
        this.toastService.showError("Invalid weather data received.");
      } else {
        this.currentWeather = currentWeather[0];
        this.generateClothingRecommendation();
      }
      if (!forecast || !forecast.DailyForecasts) {
        this.toastService.showError("Invalid forecast data received.");
      } else {
        this.forecast = forecast.DailyForecasts;
      }
      this.loaderService.removeRequest(); // Hide loader once data is fetched
    });
  }

  checkIfFavorite() {
    const locationKey = this.selectedCity?.Key;
    this.isFavorite = this.favoritesService.getFavorites().some(fav => fav.Key === locationKey);
  }

  toggleFavorite() {
    if (this.selectedCity) {
      if (this.isFavorite) {
        this.favoritesService.removeFromFavorites(this.selectedCity.Key);
        this.isFavorite = false;
        this.toastService.showSuccess(`Removed ${this.selectedCity?.LocalizedName} from favorites`);
      } else {
        this.favoritesService.addToFavorites(this.selectedCity);
        this.isFavorite = true;
        this.toastService.showSuccess(`Added ${this.selectedCity.LocalizedName} to favorites`);
      }
    }
  }

  generateClothingRecommendation() {
    if (this.currentWeather) {
      const temperature = this.currentWeather?.Temperature.Metric.Value;
      const weatherCondition = this.currentWeather?.WeatherText;

      const prompt = `Based on the temperature of ${temperature}°C and the weather condition of "${weatherCondition}", what clothes should I wear today?`;

      this.openAIService.getClothingRecommendation(prompt).subscribe(response => {
        this.clothingRecommendation = response.choices[0].text.trim();
      });
    }
  }

  // Display city name or default value
  displayCityName(city: any): string {
    return typeof city === 'object' && city?.LocalizedName ? city.LocalizedName : city || '';
  }

  isValidCitySelected(): boolean {
    return !!(this.selectedCity && this.selectedCity.Key);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
