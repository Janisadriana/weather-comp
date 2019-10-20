import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { SkyconsTypes } from 'ngx-skycons';
import { CookieService } from 'ngx-cookie-service';
import { Favorite } from './model/favorite';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  city: any;
  weatherInfo: any;
  weatherName: string;
  weather: number;
  weatherMin: number;
  weatherMax: number;
  weatherClass: string = '';
  iconColor: string = '#9360e2';
  search: string;
  parentName: string;
  windSpeed: number;
  humidity: number;
  addedToFav: boolean;
  noLocationFound: boolean;
  favorites: Favorite[] = [];

  constructor(private service:ApiService, private cookieService: CookieService) { }

  ngOnInit() {
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
      }
    }
  }

  public findLocation() {
    this.getLocation(this.search);
  }

  public getLocation(strQuery:string) {
    this.clearWeatherInfo();

    this.service.getLocations(strQuery).subscribe((data)=>{
      console.log(data);
      if(data !== null && data !== undefined) {
        var cities:any[] = data as any[];
        
        if(cities.length > 0) {
          this.city =  cities[0];
          //Validate is city is already a favority
          this.validateFavorite();

          this.service.getWeather(this.city.woeid).subscribe((data)=>{

            if(data !== null && data !== undefined) {
              var response: any = data 
              this.weatherInfo  = response.consolidated_weather[0];
              this.parentName   = response.parent.title;
              this.weather      = Math.floor(this.weatherInfo.the_temp);
              this.weatherMin   = Math.floor(this.weatherInfo.min_temp);
              this.weatherMax   = Math.floor(this.weatherInfo.max_temp);
              this.windSpeed    = Math.floor(this.weatherInfo.wind_speed);
              this.humidity     = this.weatherInfo.humidity; 

              this.weatherClass = this.weather > 23 ? 'hot-weather' : (this.weather < 15 ? 'cold-weather' : ''); 
              this.iconColor    = this.weather > 23 ? 'orangered' : (this.weather < 15 ? '#66c2e0' : '#9360e2'); 

              //Snow
              if(this.weatherInfo.weather_state_abbr === 'sn') {
                this.weatherName = SkyconsTypes.SNOW;
              }
              //Sleet or hail
              if(this.weatherInfo.weather_state_abbr === 'sl' || this.weatherInfo.weather_state_abbr === 'h') {
                this.weatherName = SkyconsTypes.SLEET;
              }
              //Thunderstorm
              if(this.weatherInfo.weather_state_abbr === 't') {
                this.weatherName = SkyconsTypes.WIND;
              }
              //Heavy Rain
              if(this.weatherInfo.weather_state_abbr === 'hr') {
                this.weatherName = SkyconsTypes.SLEET;
              }
              //Light Rain
              if(this.weatherInfo.weather_state_abbr === 'lr') {
                this.weatherName = SkyconsTypes.RAIN;
              }
              //Showers
              if(this.weatherInfo.weather_state_abbr === 's') {
                this.weatherName = SkyconsTypes.RAIN;
              }
              //Heavy Cloud
              if(this.weatherInfo.weather_state_abbr === 'hc') {
                this.weatherName = SkyconsTypes.CLOUDY;
              }
              //Light Cloud
              if(this.weatherInfo.weather_state_abbr === 'lc') {
                this.weatherName = SkyconsTypes.PARTLY_CLOUDY_DAY;
              }
              //Clear
              if(this.weatherInfo.weather_state_abbr === 'c') {
                this.weatherName = SkyconsTypes.CLEAR_DAY;
              }
            }
          })
        } else {
          this.noLocationFound = true;
        }
      } 
    });
  }

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
  }

  public revomeFromFavorites(woeid:number) {
    let index = -1;

    for(var i = 0; i < this.favorites.length; i++) {

      if(this.favorites[i].woeid === woeid) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
        this.favorites.splice(index, 1);
    }   
    this.validateFavorite();
  }

  public goToFavorite(fav: Favorite) {
    this.getLocation(fav.title);
  }

  public clearWeatherInfo() {
    this.city          = null;
    this.weatherInfo   = null;
    this.weather       = null;
    this.weatherName   = null;
    this.weatherMin    = null;
    this.weatherMax    = null;
    this.weatherClass  = '';
    this.iconColor     = '#9360e2';
    this.noLocationFound = false;
  }
}
