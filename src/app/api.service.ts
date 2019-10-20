import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
/**
 * API service to connect to the external API
 */
export class ApiService {

  //Metaweather end point
  END_POINT = 'https://www.metaweather.com/api/';
  
  //Request header parameters
  headerDict = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Headers': 'access-control-allow-headers,access-control-allow-methods,access-control-allow-origin,content-type',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD, OPTIONS',
    'Access-Control-Allow-Origin': '*'
  };

  constructor(private httpClient: HttpClient) { 
  }

  /**
   * Gets locations from Metaweather API
   * @param queryStr 
   * @returns API response
   */
  public getLocations(queryStr:String){
    
    return this.httpClient.get(
      this.END_POINT + 'location/search/?query=' + queryStr, {
        headers: this.headerDict
      });
  }

  /**
   * Gets weather from Metaweather API using the woeid code
   * @param query 
   * @returns API response
   */
  public getWeather(query:number){
    return this.httpClient.get(this.END_POINT + 'location/' + query + "/", {
        headers: this.headerDict
      });
  }
}
