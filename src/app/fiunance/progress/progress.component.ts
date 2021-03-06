import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chart } from 'chart.js';
import { CoronaserviceService } from './../../coronaservice.service';
import { AppSettings } from 'src/app/AppSettings';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  username: string;
  roles: string;
  role_list: object[];
  user_diffdays: any;
  constructor(private http: HttpClient, private ds: CoronaserviceService) {

  }
  closedTrd: object[];
  readonly baseUrl = AppSettings.baseUrl;
  recentdaily:String[];

  data: object[];
  chart:Chart = [];
  frontMonth:Chart = [];
  nextMonth:Chart = [];
  monthly:Chart = [];
  loading = false;

  dataof: object[];
  datamonthly:object[];
  index: number = 5;
  type: string = "total";
  perc_change: string = " ";
  monthone: string;
  monthtwo: string;

  account_1: string;
  account_2: string;
  account_3: string;

  networth: any;
  switch_networth: boolean = true;
  add_networth: string = "add new";
  check_date: boolean = true;

  type_key: string;

  gains: object[];

  current: object[];

  curr_date= formatDate(new Date(), 'MM/dd/yyyy', 'en');

  clickedAdd: boolean = false;

  formatTheDate(x){
    return formatDate(new Date(x), 'yyyy-MM-dd', 'en');

  }

  count_values: number = 0;
  addAccount(event, value: string){
    this.count_values = this.count_values + 1;
    var d = document.getElementById(value).getElementsByTagName('tbody')[0];
    var newRoww = d.insertRow(0);
    var newCell1 = newRoww.insertCell()
    newCell1.setAttribute('style', 'border: none;');
    var newCell2 = newRoww.insertCell()
    newCell2.setAttribute('style', 'border: none;');
    var newText1 = document.createElement('input');
    newText1.setAttribute('type', 'text');
    newText1.setAttribute('id', value+'name_'+this.count_values);
    var newText3 = document.createElement('input');
    newText3.setAttribute('type', 'number');
    newText3.setAttribute('id', value+'value_'+this.count_values);
    newCell1.appendChild(newText1);
    newCell2.appendChild(newText3);
  }
  inputval: number;
  changeInputVal(event){
    this.inputval = Number((event.target as HTMLInputElement).value);
  }
  updateNetWorth(isdebt: string, type: string){
    var table = document.getElementById(type);
    var tbodies = table.getElementsByTagName("tbody")[0].rows;
    var row_len = Number(tbodies.length) -1;
    console.log(this.inputval);
    for(var i=0;i<row_len;i++){
      var type_name = (tbodies[i].cells[0].firstChild as HTMLInputElement).value;
      if(type_name == undefined){
        type_name = tbodies[i].cells[0].firstChild.nodeValue;
      }
      if(type_name.length>1){
        this.networth[0][isdebt][type][type_name] = Number(this.inputval);

      }
    }

    this.networth[0]['net'] = this.net(this.networth[0]);
    delete this.networth[0]['isActive'];

    this.http
      .post(
        this.baseUrl +
          "data/"+this.username+"/networth/update", this.networth[0])
      .subscribe((data) => {
        this.networth = data as object[];
      });
  }
  onClickAddNewData(){
    this.clickedAdd = true;
  }
  onClickCloseAddNewData(){
    this.clickedAdd = false;
  }
  clickedEdit: boolean = false;
  onClickEditData(){
    this.clickedEdit = true;
  }
  onClickCloseEditData(){
    this.clickedEdit = false;
  }

  switch(){
    if(this.switch_networth==true){
      this.add_networth = "update";
      if(this.networth[0]['date']==formatDate(new Date(), 'MM/dd/yyyy', 'en')){
        this.check_date = false;
      }else{
        this.check_date = true;
      }
      this.switch_networth = false;
    }else{
      this.add_networth = "add new";
      this.switch_networth = true;
    }

  }

  changeType(type: string){
    Chart.helpers.each(Chart.instances, function (instance) {
      if (instance.chart.canvas.id === "canvas") {
        instance.destroy();
        return;
      }
    });
    if (type === 'fidelity'){
      this.index = 1;
      this.type = type;
      this.type_key = this.account_1;
    }else if (type === 'robinhood'){
      this.index = 2;
      this.type = type;
      this.type_key = this.account_2;
    }else if (type === 'tastyworks'){
      this.index = 3;
      this.type = type;
      this.type_key = this.account_3;
    }else if (type === 'retirement'){
      this.index = 4;
      this.type = type;
      this.type_key = 'retirement';
    }else if (type === 'total'){
      this.index = 5;
      this.type = type;
      this.type_key = 'total';
    }
    this.charting();
  }
  ngOnInit() {

    this.type_key = this.type;
    this.ds.current.subscribe(message => this.username = message);

    this.http
      .get(
        this.baseUrl +
          "data/"+this.username+"/networth/get")
      .subscribe((data) => {
        this.networth = data as object[];
      });

    this.http
      .get(
        this.baseUrl +
          "data/"+this.username+"/accounts")
      .subscribe((data) => {
        this.account_1 = data['fidelity'];
        this.account_2 = data['robinhood'];
        this.account_3 = data['tastyworks'];
      });
    this.gainsProgress();
    this.charting();
    this.gainsProgressMonthly();
    this.http.get(this.baseUrl+'data/roles/get').subscribe((data) => {
      this.role_list = data as object[];
      this.role_list.forEach(d => {
        if(d['userid']===this.username){
          this.roles = d['role'];
          var date1 = new Date(d['join']);
          var date2 = new Date();
          var diff = Math.abs(date1.getTime() - date2.getTime());
          this.user_diffdays = 14 - Math.ceil(diff / (1000 * 3600 * 24));
          if(this.user_diffdays<0){
            this.user_diffdays = "ENDED";
          }else{
            this.user_diffdays = String(this.user_diffdays) + " days";
          }
        }
      });
    });
    this.http.get(this.baseUrl+'data/'+this.username+'/daily/get').subscribe((data) => {
      this.recentdaily = data as string[];
    });
  }

  toggleAccordian(event, index) {
    var element = event.target;
    element.classList.toggle("active");
    if(this.networth[index].isActive) {
      this.networth[index].isActive = false;
    } else {
      this.networth[index].isActive = true;
    }
    var panel = element.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }
  getValuesFromJson(data: object){
    var ret = [];
    for(var x in data){
      var vals = [x, data[x]];
      ret.push(vals);
    }
    return ret;
  }
  total(data: object){
    var ret = 0;
    for(var x in data){
      ret = ret + data[x];

    }
    return ret;
  }
  net(data: object){
    var credit = 0;
    var debt = 0;
    for(var x in data['pos']){
      for(var y in data['pos'][x]){
        credit = credit + data['pos'][x][y];
      }
    }
    for(var x in data['neg']){
      for(var y in data['neg'][x]){
        debt = debt + data['neg'][x][y];
      }

    }
    return (credit - debt);
  }
  gainsProgressMonthly(){
    Chart.helpers.each(Chart.instances, function (instance) {
      if (instance.chart.canvas.id === "canvas_monthly") {
        instance.destroy();
        return;
      }
    });
    this.http
      .get(
        this.baseUrl +
        "data/"+this.username+"/gains/monthly")
      .subscribe((data2) => {
        this.datamonthly = data2 as object[];
        this.monthly = new Chart("canvas_monthly", {
          type: "bar",
          data: {
            labels: this.datamonthly[0],
            datasets: [
              {
                data: this.datamonthly[1],
                fill: false,
                borderColor: "wheat",
                backgroundColor: "wheat",
                pointHoverBackgroundColor: "wheat",
                pointHoverBorderColor: "wheat"
              }
            ]
          },
          options: {
            showAllTooltips: true,
            legend: {
              display: false
            },
            plugins: {
              datalabels: {
                 display: true,
                 align: 'center',
                 anchor: 'center'
              }
           },
            scales: {
              xAxes: [{
                display: true,
                ticks: {
                  fontColor: "wheat", // this here
                },
                gridLines: {
                  color: 'black',
                  zeroLineColor: 'wheat'
                }
              }],
              yAxes: [{
                display: true,
                ticks: {
                  fontColor: "wheat",
                },
                gridLines: {
                  color: 'wheat',
                  zeroLineColor: 'wheat'
                }
              }],
            }
          }
        });
      });

  }
  gainsProgress(){

    Chart.helpers.each(Chart.instances, function (instance) {
      if (instance.chart.canvas.id === "canvas_front") {
        instance.destroy();
        return;
      }
    });
    Chart.helpers.each(Chart.instances, function (instance) {
      if (instance.chart.canvas.id === "canvas_next") {
        instance.destroy();
        return;
      }
    });
    this.http
      .get(
        this.baseUrl +
        "data/"+this.username+"/progress/gains")
      .subscribe((data2) => {
        this.dataof = data2 as object[];
        this.monthone = this.dataof[3][0];
        this.monthtwo = this.dataof[3][1];
        this.frontMonth = new Chart("canvas_front", {
          type: "bar",
          data: {
            labels: this.dataof[0],
            datasets: [
              {
                data: this.dataof[1],
                fill: false,
                borderColor: "wheat",
                backgroundColor: "wheat",
                pointHoverBackgroundColor: "wheat",
                pointHoverBorderColor: "wheat"
              }
            ]
          },
          options: {
            showAllTooltips: true,
            legend: {
              display: false
            },
            plugins: {
              datalabels: {
                 display: true,
                 align: 'center',
                 anchor: 'center'
              }
           },
            scales: {
              xAxes: [{
                display: true,
                ticks: {
                  fontColor: "wheat", // this here
                },
                gridLines: {
                  color: 'black',
                  zeroLineColor: 'wheat'
                }
              }],
              yAxes: [{
                display: true,
                ticks: {
                  fontColor: "wheat",
                },
                gridLines: {
                  color: 'wheat',
                  zeroLineColor: 'wheat'
                }
              }],
            }
          }
        });
        this.nextMonth = new Chart("canvas_next", {
          type: "bar",
          data: {
            labels: this.dataof[0],
            datasets: [
              {
                data: this.dataof[2],
                fill: false,
                borderColor: "wheat",
                backgroundColor: "wheat",
                pointHoverBackgroundColor: "wheat",
                pointHoverBorderColor: "wheat"
              }
            ]
          },
          options: {
            legend: {
              display: false
            },
            scales: {
              xAxes: [{
                display: true,
                ticks: {
                  fontColor: "wheat", // this here
                },
                gridLines: {
                  color: 'black',
                  zeroLineColor: 'wheat'
                }
              }],
              yAxes: [{
                display: true,
                ticks: {
                  fontColor: "wheat",
                },
                gridLines: {
                  color: 'wheat',
                  zeroLineColor: 'wheat'
                }
              }],
            }
          }
        });
      });
  }

  currentProgress(){
    //this.loading = true;
    this.http
      .get(
        this.baseUrl +
        "data/"+this.username+"/progress/current")
      .subscribe((data) => {
        console.log(data);
        this.current = data as object[];
        //this.loading = false;
      });
  }
  addmsg:String[];
  addmsg_done:String;
  data_msg:String;
  addDataHistoric(){
    this.http
      .get(
        this.baseUrl +
        "data/"+this.username+"/daily/" +
          (document.getElementById("fidelity") as HTMLInputElement).value +
          "/" +
          (document.getElementById("robinhood") as HTMLInputElement).value +
          "/" +
          (document.getElementById("tastyworks") as HTMLInputElement).value +
          "/" +
          (document.getElementById("retirement") as HTMLInputElement).value +
          "/" +
          (document.getElementById("fidelity_c") as HTMLInputElement).value +
          "/" +
          (document.getElementById("robinhood_c") as HTMLInputElement).value +
          "/" +
          (document.getElementById("tastyworks_c") as HTMLInputElement).value +
          "/" +
          (document.getElementById("retirement_c") as HTMLInputElement).value
      )
      .subscribe((data) => {
        this.addmsg_done = data[0];

      },
      (error) => {
        if(error['status'].toString() === '404'){
          this.addmsg = ['Error: All fields are required'];
        }else{
          this.addmsg = error['status'];
        }
        this.addmsg_done = undefined;
      });
  }
  del_obj:object;
  sure_del:boolean = false;
  sure(date_:String){
    this.del_obj = {
      date: date_
    }
    this.http
      .post(
        this.baseUrl +
        "data/"+this.username+"/deletedaily", this.del_obj).subscribe((data) => {


        });
        this.sure_del = true;
  }

  retValGreater(val: string, num: string):boolean{
    if(parseFloat(val) > parseFloat(num)){
      return true ;
    }else{
      return false ;
    }

  }

  charting() {
    Chart.helpers.each(Chart.instances, function (instance) {
      if (instance.chart.canvas.id === "canvas") {
        instance.destroy();
        return;
      }
    });

    this.perc_change = "";
    this.http.get(this.baseUrl + "data/"+this.username+"/daily").subscribe(res => {
      this.data = res as object[];
      this.chart = new Chart("canvas", {
        type: "line",
        data: {
          labels: this.data[0]['date'],
          datasets: [
            {
              data: this.data[this.index][this.type],
              fill: false,
              borderColor: "wheat",
              backgroundColor: "wheat",
              pointHoverBackgroundColor: "wheat",
              pointHoverBorderColor: "wheat"
            }
          ]
        },
        options: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: true,
              ticks: {
                fontColor: "wheat", // this here
              },
              gridLines: {
                color: 'black',
                zeroLineColor: 'wheat'
              }
            }],
            yAxes: [{
              display: true,
              ticks: {
                fontColor: "wheat",
              },
              gridLines: {
                color: 'wheat',
                zeroLineColor: 'wheat'
              }
            }],
          }
        }
      });
    });
    this.http.get(this.baseUrl+'data/'+this.username+'/daily/get').subscribe((data) => {
      this.recentdaily = data as string[];
    });
    this.sure_del = false;
    this.addmsg_done = undefined;
  }
  updatemsg:String[];
  updatemsg_done:String;
  updatedDaily(){
    this.http
      .get(
        this.baseUrl +
        "data/"+this.username+"/updatedaily/" +
        this.formatTheDate((document.getElementById("date_y") as HTMLInputElement).value) +
          "/" +
          (document.getElementById("fidelity_y") as HTMLInputElement).value +
          "/" +
          (document.getElementById("robinhood_y") as HTMLInputElement).value +
          "/" +
          (document.getElementById("tastyworks_y") as HTMLInputElement).value +
          "/" +
          (document.getElementById("retirement_y") as HTMLInputElement).value +
          "/" +
          this.formatTheDate((document.getElementById("date_t") as HTMLInputElement).value) +
          "/" +
          (document.getElementById("fidelity_t") as HTMLInputElement).value +
          "/" +
          (document.getElementById("robinhood_t") as HTMLInputElement).value +
          "/" +
          (document.getElementById("tastyworks_t") as HTMLInputElement).value +
          "/" +
          (document.getElementById("retirement_t") as HTMLInputElement).value
      )
      .subscribe((data) => {
        console.log(data);
        this.updatemsg = undefined;
      },
      (error) => {
        if(error['status'].toString() === '404'){
          this.updatemsg = ['Error: All fields are required'];
          this.updatemsg_done = undefined;
        }else{
          this.updatemsg = [];
          this.updatemsg_done = "Success!";
        }
      });
      this.http.get(this.baseUrl+'data/'+this.username+'/daily/get').subscribe((data) => {
        this.recentdaily = data as string[];
      });
      this.loading = false;

        this.charting() ;

  }
  filterHist(filter: string){

    Chart.helpers.each(Chart.instances, function (instance) {
      if (instance.chart.canvas.id === "canvas") {
        instance.destroy();
        return;
      }
    });

    this.http.get(this.baseUrl + "data/"+this.username+"/daily/" + this.index + "/" + this.type + "/" + filter)
      .subscribe((res) => {
        this.data = res as object[];
        this.perc_change = this.data['change'];
        this.chart = new Chart("canvas", {
          type: "line",
          data: {
            labels: this.data['date'],
            datasets: [
              {
                data: this.data[this.type],
                fill: false,
                borderColor: "wheat",
                backgroundColor: "wheat",
                pointHoverBackgroundColor: "wheat",
                pointHoverBorderColor: "wheat"
              }
            ]
          },
          options: {
            legend: {
              display: false
            },
            scales: {
              xAxes: [{
                display: true,
                ticks: {
                  fontColor: "wheat", // this here
                },
                gridLines: {
                  color: 'black',
                  zeroLineColor: 'wheat'
                }
              }],
              yAxes: [{
                display: true,
                ticks: {
                  fontColor: "wheat",
                },
                gridLines: {
                  color: 'wheat',
                  zeroLineColor: 'wheat'
                }
              }],
            }
          }
        });
      });
  }

}
