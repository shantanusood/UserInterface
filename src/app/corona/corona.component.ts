import { Component, HostListener, Inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-corona',
  templateUrl: './corona.component.html',
  styleUrls: ['./corona.component.css']
})
export class CoronaComponent implements OnInit{

  public towns = [];
  public townSelected;

  stocks = false;
  etfs = false;
  index = false;
  mutual = false;
  futures = false;
  currency = false;
  options = false;

  type:string = "";

  constructor(private http: HttpClient) {

      this.towns = [
          "New York", "Washington, D.C.", "London", "Berlin", "Sofia", "Rome", "Kiev",
          'Copenhagen', "Paris", "Barcelona", "Vienna", "Athens", "Dublin", "Yerevan",
          "Oslo", "Helsinki", "Stockholm", "Prague", "Istanbul", "El Paso", "Florence", "Moscow",
          "Jambol", "Talin", "Zlatna Panega", "Queenstown", "Gabrovo", "Ugurchin", "Xanthi"
        ];
  }
  ngOnInit() {

  }
}

@Pipe({ name: 'contains' })
export class AutocompletePipeCorona implements PipeTransform {
  public transform(collection: any[], term = '') {
      return collection.filter((item) => item.toString().toLowerCase().includes(term.toString().toLowerCase()));
  }
}