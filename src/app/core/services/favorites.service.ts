import { Injectable } from '@angular/core';
import { Location } from 'src/app/shared/models/location.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favorites: Location[] = [];

  constructor() {
    this.loadFavorites(); 
  }

  private saveFavorites(): void {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  private loadFavorites(): void {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      this.favorites = JSON.parse(storedFavorites);
    }
  }

  addToFavorites(location: Location): void {
    if (!this.isFavorite(location.Key)) {
      this.favorites.push(location);
      this.saveFavorites();
    }
  }

  removeFromFavorites(locationKey: string): void {
    this.favorites = this.favorites.filter(fav => fav.Key !== locationKey);
    this.saveFavorites();
  }

  getFavorites(): Location[] {
    return this.favorites;
  }

  isFavorite(locationKey: string): boolean {
    return this.favorites.some(fav => fav.Key === locationKey);
  }
}
