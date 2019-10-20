import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  END_POINT = 'https://www.metaweather.com/api/';

  constructor(private httpClient: HttpClient) { 
  }

  public getLocations(queryStr:String){
    return this.httpClient.get(
      this.END_POINT + 'location/search/?query=' + queryStr);
  }

  public getWeather(query:number){
    return this.httpClient.get(this.END_POINT + 'location/' + query + "/");
  }
}
