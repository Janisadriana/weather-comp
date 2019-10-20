import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { CookieService } from 'ngx-cookie-service';
import { Favorite } from './model/favorite';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
/**
 * Weather main component
 */
export class AppComponent implements OnInit{

  //Parameters used by the html
  city: any;
  weatherInfo: any;
  weather: number;
  weatherMin: number;
  weatherMax: number;
  weatherClass: string = '';
  weatherName: string;
  weatherIcon: string = 'windy';
  search: string;
  parentName: string;
  windSpeed: number;
  humidity: number;
  addedToFav: boolean;
  noLocationFound: boolean;
  searching: boolean;
  favorites: Favorite[] = [];

  //Parameter used to create the interval to update favorites weather value
  subscription: Subscription;

  constructor(private service:ApiService, private cookieService: CookieService) { }

  ngOnInit() {
    //Get favorites cookie value
    var favStr = this.cookieService.get('favorites');
    var favs   = favStr.split(',');

    if(favStr !== null && favStr !== undefined && favStr !== '') {
      if(favs !== null &&  favs.length > 0) {
        for(let i = 0; i < favs.length; i++) {
          var woeid = favs[i].split(':')[0];
          var title = favs[i].split(':')[1];
          var favorite = new Favorite();
          favorite.title = title;
          favorite.woeid = parseInt(woeid);
          this.favorites.push(favorite);
        }
        this.updateFavoritesWeather();
      }
    }

    //Create interval to update favorites weather value every 30 minutes
    const source = interval(1800000);
    this.subscription = source.subscribe(val => this.updateFavoritesWeather());
  }

  /**
   * Gets location and its weather information. Method used by the find button.
   */
  public findLocation() {
    this.getLocation(this.search);
  }

  /**
   * Find locations and weather, if location found, using the strQuery param.
   * @param strQuery 
   */
  public getLocation(strQuery:string) {
    //Shows loading component
    this.searching = true;
    this.clearWeatherInfo();

    //Call API service to get location
    this.service.getLocations(strQuery).subscribe((data)=>{
      console.log(data);
      if(data !== null && data !== undefined) {
        var cities:any[] = data as any[];
        
        if(cities.length > 0) {
          this.city =  cities[0];
          //Validate is city is already a favority
          this.validateFavorite();

          //Call API service to get weather information
          this.service.getWeather(this.city.woeid).subscribe((data)=>{

            if(data !== null && data !== undefined) {
              //Load data used in the html
              var response: any = data;
              this.weatherInfo  = response.consolidated_weather[0];
              this.weatherName  = this.weatherInfo.weather_state_name;
              this.parentName   = response.parent.title;
              this.weather      = Math.floor(this.weatherInfo.the_temp);
              this.weatherMin   = Math.floor(this.weatherInfo.min_temp);
              this.weatherMax   = Math.floor(this.weatherInfo.max_temp);
              this.windSpeed    = Math.floor(this.weatherInfo.wind_speed);
              this.humidity     = this.weatherInfo.humidity; 

              this.weatherClass = this.weather > 23 ? 'hot-weather' : (this.weather < 15 ? 'cold-weather' : ''); 

              //Snow
              if(this.weatherInfo.weather_state_abbr === 'sn') {
                this.weatherIcon = 'snow';
              }
              //Sleet
              if(this.weatherInfo.weather_state_abbr === 'sl') {
                this.weatherIcon = 'snow_rain';
              }
              //Hail
              if(this.weatherInfo.weather_state_abbr === 'h') {
                this.weatherIcon = 'hail';
              }
              //Thunderstorm
              if(this.weatherInfo.weather_state_abbr === 't') {
                this.weatherIcon = 'storm';
              }
              //Heavy Rain
              if(this.weatherInfo.weather_state_abbr === 'hr') {
                this.weatherIcon = 'lightning';
              }
              //Light Rain
              if(this.weatherInfo.weather_state_abbr === 'lr') {
                this.weatherIcon = 'rain';
              }
              //Showers
              if(this.weatherInfo.weather_state_abbr === 's') {
                this.weatherIcon = 'party_cloudy_with_rain';
              }
              //Heavy Cloud
              if(this.weatherInfo.weather_state_abbr === 'hc') {
                this.weatherIcon = 'cloudy';
              }
              //Light Cloud
              if(this.weatherInfo.weather_state_abbr === 'lc') {
                this.weatherIcon = 'party_cloudy';
              }
              //Clear
              if(this.weatherInfo.weather_state_abbr === 'c') {
                this.weatherIcon = 'sunny';
              }
            }
            //Hides loading component
            this.searching = false;
          }); 
        } else {
          //Shows Location not found message
          this.noLocationFound = true;
          //Hides loading component
          this.searching = false;
        }
      } else {
        //Hides loading component
        this.searching = false;
      }
    });
  }

  /**
   * Update favorites weather value
   */
  public updateFavoritesWeather() {

    if(this.favorites.length > 0) {
    
      for(let fav of this.favorites) {
        
        this.service.getWeather(fav.woeid).subscribe((data)=>{

          if(data !== null && data !== undefined) {
            var response: any = data;
            fav.weather       = Math.floor(response.consolidated_weather[0].the_temp);
          }
        });
      }
    }
  }

  /**
   * Validate if location is in favorites array
   */
  public validateFavorite() {
    this.addedToFav = false;

    if(this.favorites.length > 0) {
    
      for(let fav of this.favorites) {
        
        if(fav.woeid === this.city.woeid) {
          this.addedToFav = true;
          break;
        }
      }
    }
  }

  /**
   * Add to favorites
   */
  public addToFavorite() {
    if(this.favorites.length === 3) {
      this.favorites.shift();
    }
    var fav     = new Favorite();
    fav.title   = this.city.title;
    fav.woeid   = this.city.woeid;
    fav.weather = this.weather;
    this.favorites.push(fav);
    this.validateFavorite();
    this.updateCookie();
  }

  /**
   * Remove from favorites using the woeid code
   * @param woeid 
   */
  public revomeFromFavorites(woeid:number) {
    let index = -1;

    for(let i = 0; i < this.favorites.length; i++) {

      if(this.favorites[i].woeid === woeid) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
        this.favorites.splice(index, 1);
    }   
    this.validateFavorite();
    this.updateCookie();
  }

  /**
   * Load favorites info in the weather component
   * @param fav 
   */
  public goToFavorite(fav: Favorite) {
    this.getLocation(fav.title);
  }

  /**
   * Clear form and html data
   */
  public clearWeatherInfo() {
    this.city          = null;
    this.weatherInfo   = null;
    this.weather       = null;
    this.weatherIcon   = 'windy';
    this.weatherMin    = null;
    this.weatherMax    = null;
    this.weatherClass  = '';
    this.noLocationFound = false;
    this.weatherName   = '';
  }

  /**
   * Update favorites cookie value
   */
  private updateCookie() {
    var favs:string = '';

    if(this.favorites.length > 0) {
      for(let i = 0; i < this.favorites.length; i++) {
        var fav = this.favorites[i];
        favs = favs + fav.woeid + ':' + fav.title;

        if(i + 1 < this.favorites.length) {
          favs = favs + ',';
        }
      }
    }
    this.cookieService.set('favorites', favs);
  }
}

