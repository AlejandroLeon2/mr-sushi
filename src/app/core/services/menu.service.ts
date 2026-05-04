import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MenuResponse, PriceRangesResponse } from '../models/menu.model';
import { RestaurantInfo } from '../models/restaurant.model';

// Local data imports
import menuDataLocal from '../../data/menu_render.json';
import priceRangesLocal from '../../data/price_ranges.json';
import restaurantLocal from '../../data/restaurant.json';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  /**
   * Flag to toggle between local data and API data.
   * false: use local JSON files in src/app/data
   * true: use API calls
   */
  private useApi = false;
  private apiUrl = 'https://api.mr-sushi.com/v1'; // Placeholder URL

  constructor(private http: HttpClient) {}

  /**
   * Set the data source flag.
   * @param value boolean
   */
  setUseApi(value: boolean): void {
    this.useApi = value;
  }

  /**
   * Get the full menu data.
   */
  getMenuData(): Observable<MenuResponse> {
    if (this.useApi) {
      return this.http.get<MenuResponse>(`${this.apiUrl}/menu`);
    } else {
      // Wrap local data in an observable to maintain consistent return type
      return of(menuDataLocal as MenuResponse);
    }
  }

  /**
   * Get all price ranges.
   */
  getPriceRanges(): Observable<PriceRangesResponse> {
    if (this.useApi) {
      return this.http.get<PriceRangesResponse>(`${this.apiUrl}/price-ranges`);
    } else {
      return of(priceRangesLocal as PriceRangesResponse);
    }
  }

  /**
   * Get restaurant information and settings.
   */
  getRestaurantInfo(): Observable<RestaurantInfo> {
    if (this.useApi) {
      return this.http.get<RestaurantInfo>(`${this.apiUrl}/restaurant`);
    } else {
      return of(restaurantLocal as RestaurantInfo);
    }
  }
}
