import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AppSettings } from '../AppSettings';
import { Chart } from 'chart.js';
import { Dialog } from '../fiunance/fiunance.component';

export interface DialogData {
  type: string;
  view: object;
}

export interface Dialog4Data {
  tick: string;
  parent: string;
  tickname: string;
  url: string;
  sub:object,
  curCat: string
}

export interface Dialog5Data {
  tick: string;
  tickname: string;
  url: string;
}

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.css']
})
export class SyncComponent implements OnInit {

  readonly baseUrl = AppSettings.baseUrl;

  run_spinner: boolean = false;
  sectors: Object;
  parentSectors = [];
  subSectors = [];
  tickers = [];
  dump_res: String = "";
  selectedParent: String = "Commodity";
  selectedsubsector: String = "All";
  view_type: object;

  chart_boolean: boolean = false;
  chart_title: string = "";
  values = [];
  dates = new Set();
  chart:Chart = [];

  constructor(private http: HttpClient, public dialog: MatDialog) { }

  ngOnInit() {
    this.http.get(this.baseUrl + "data/getSectors").subscribe((data) => {
      this.sectors = data as object;
        for(var k in this.sectors){
          this.parentSectors.push(k);
        }
      });
  }

  selectParent(value: String) {
    this.selectedParent = value;
   }
   selectSubSector(value: String) {
    this.selectedsubsector = value;
   }

   getSubSectors(){
    this.http.get(this.baseUrl + "data/getSubSectors/"+this.selectedParent).subscribe((data) => {
      this.subSectors = data as object[];
      });
   }
   getTickers(){
    this.http.get(this.baseUrl + "data/metadata/stocks/USA/"+this.selectedParent+ "/"+ this.selectedsubsector).subscribe((data) => {
      this.tickers = data as object[];
      });
   }
   dump(x:object, type: string){
    this.http.get(this.baseUrl + "data/"+type+ "/"+ x['Ticker']).subscribe((incoming) => {
      this.http.post(this.baseUrl + "data/sync/dump/"+this.selectedParent
        + "/"+ this.selectedsubsector + "/" + x['Ticker'] + "/" + type, incoming as Object).subscribe((data) => {
          this.http.get(this.baseUrl + "data/metadata/stocks/USA/"+this.selectedParent+ "/"+ this.selectedsubsector).subscribe((data_tick) => {
            this.tickers = data_tick as object[];
          this.dump_res = data as String;
        });
      });
    });
   }
   update(x:object, type: string){
    this.http.get(this.baseUrl + "data/"+type+ "/"+ x['Ticker']).subscribe((incoming) => {
      this.http.post(this.baseUrl + "data/sync/update/"+this.selectedParent
        + "/"+ this.selectedsubsector + "/" + x['Ticker'] + "/" + type, incoming as Object).subscribe((data) => {
          this.http.get(this.baseUrl + "data/metadata/stocks/USA/"+this.selectedParent+ "/"+ this.selectedsubsector).subscribe((data_tick) => {
            this.tickers = data_tick as object[];
          this.dump_res = data as String;
        });
      });
    });
   }
   view(x:object, _type: string){

    this.http.get(this.baseUrl + "data/get/"+this.selectedParent+ "/"+ x['Category'] + "/" + x['Ticker'] + "/" + _type).subscribe((data_tick) => {
      this.view_type = data_tick as object;
      const dialogRef = this.dialog.open(Dialog_sync, {
        maxHeight: '800px',
        autoFocus: false,
        data: {type: _type, view: this.view_type}
      });

  });
   }
   custom_sort(a, b) {
    return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
  }
   viewIndicator(x:object, _type: string){

    this.http.get(this.baseUrl + "data/get/"+this.selectedParent+ "/indicators/" + x['Ticker'] + "/" + _type).subscribe((data_tick) => {
      this.view_type = data_tick as object;
      this.chart_boolean = true;
        for(var x in this.view_type){

          this.dates.add(new Date(x));
          this.values.push(this.view_type[x]);
        }
        this.chart = this.charting(this.values, Array.from(this.dates).sort(), 'line', 'canvas');

    });
   }
   syncSector(type: String){
    this.run_spinner = true;
      this.http.get(this.baseUrl + "data/sync/sector/"+this.selectedParent
        + "/"+ this.selectedsubsector + "/" + type).subscribe((data) => {
          this.http.get(this.baseUrl + "data/metadata/stocks/USA/"+this.selectedParent+ "/"+ this.selectedsubsector).subscribe((data_tick) => {
            this.tickers = data_tick as object[];
          this.dump_res = data as String;
          this.run_spinner = false;
        });
      });
   }
   dateDiff(dt: string){
     var second:any = new Date(dt);
    var first:any = new Date();
    return Math.round((first-second)/(1000*60*60*24));
   }
   dumpIndicator(x:object, type: string){
    this.http.get(this.baseUrl + "indicators/"+ x['Ticker']).subscribe((incoming) => {
      this.http.post(this.baseUrl + "data/sync/indicators/"+this.selectedParent
        + "/" + x['Ticker'] + "/" + type, incoming as Object).subscribe((data) => {
          this.http.get(this.baseUrl + "data/metadata/stocks/USA/"+this.selectedParent+ "/"+ this.selectedsubsector).subscribe((data_tick) => {
            this.tickers = data_tick as object[];
          this.dump_res = data as String;
        });
      });
    });
   }
   charting(data_input, labels_input, chart_type, canvas_id){
    return new Chart(canvas_id, {
      type: chart_type,
      data: {
        labels: labels_input,
        datasets: [
          {
            data: data_input,
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
  }

  changeCat(ticker: String, tickname:String, curSect: String){

    this.http.get(this.baseUrl + "data/getAllSubSectors").subscribe((datax) => {
      this.http.get(this.baseUrl + "data/getParent/"+curSect).subscribe((prt) => {
        const dialogRef = this.dialog.open(DialogSync2, {
          width: '500px',
          data: {
            tick: ticker,
            parent: prt['parent'],
            tickname: tickname,
            url: this.baseUrl + "data/sync/move/"+ticker+"/",
            sub:datax,
            curCat: curSect
          }
        });

        dialogRef.afterClosed().subscribe(result => {

        });
      });
    });
  }

  links(ticker: String, tickname: String){

      const dialogRef = this.dialog.open(DialogSyncLinks, {
        width: '500px',
        data: {
          tick: ticker,
          tickname: tickname,
          url: this.baseUrl + "data/sync/links/"+ticker,
        }
      });

      dialogRef.afterClosed().subscribe(result => {

      });
  }

}

@Component({
  selector: 'dialog-overview-example-dialog',
  styleUrls: ['./view.css'],
  templateUrl: './view.html'
})
export class Dialog_sync {
  fields = new Set();
  actuals = [];

  constructor(
    public dialogRef: MatDialogRef<Dialog_sync>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {



      var first: string = "";
      for(var x in this.data['view']){
        first = x;
        break;
      }
      var vals: object = this.data['view'][first];
      for(var y in vals){
        this.fields.add(y);
      }
      this.actuals.push(Array.from(this.fields));
      var heads = this.getHeaders();
      for(var i = 0; i < heads.length; i++){
        this.actuals.push(this.getData(heads[i]))
      }
    }

    getHeaders(){
      var heads = [];
      for(var x in this.data['view']){
        heads.push(x)
      }
      return heads;
    }

    getData(value: string){
      var vals = this.data['view'][value];
      var data_ = [];
      for(var x in vals){
        data_.push(vals[String(x)]);
      }
      return data_;
    }

    onNoClick(): void {

      this.dialogRef.close();

    }


}

@Component({
  selector: 'dialog-overview-example-dialog4',
  templateUrl: './dialog4.html',
  styleUrls: ["./dialog4.css"]
})
export class DialogSync2 {
  move_data: any;
  selectedsubsector: String;
  constructor(
    public dialogRef: MatDialogRef<Dialog>,
    @Inject(MAT_DIALOG_DATA) public data: Dialog4Data, private http: HttpClient) {
    }

    url: string = this.data['url']

    onNoClick(): void {
      this.dialogRef.close();
    }

    selectNewSubSector(value: String) {
      this.selectedsubsector = value;
     }

     err_msg: String;

    moveCat(){
      this.http.get(this.url + this.selectedsubsector).subscribe((datax) => {
        this.move_data = datax;
        this.onNoClick()
      },
      error => {
        this.err_msg = error;
      });
    }

}

@Component({
  selector: 'dialog-overview-example-dialog4',
  templateUrl: './dialog5.html',
  styleUrls: ["./dialog5.css"]
})
export class DialogSyncLinks {
  links_tick: any;
  links_tick_lst: String[];

  url: string = this.data['url']
  err_msg:String;

  constructor(
    public dialogRef: MatDialogRef<Dialog>,
    @Inject(MAT_DIALOG_DATA) public data: Dialog5Data, private http: HttpClient) {
      this.http.post(this.url + "/get", {'link': ""}).subscribe((datax) => {
        this.links_tick = datax;
        this.links_tick_lst = this.links_tick[data['tick']];
      },
      error => {
        this.err_msg = error['statusText'];

      });
    }

    add(){
      this.http.post(this.url + "/add", {'link': [(document.getElementById("type") as HTMLInputElement).value,(document.getElementById("newLink") as HTMLInputElement).value]

      }).subscribe((datax) => {
        this.links_tick = datax;
        this.links_tick_lst = this.links_tick[this.data['tick']];
      },
      error => {
        this.err_msg = error['statusText'];

      });
    }
    rem(lnk: String[]){
      this.http.post(this.url + "/remove", {'link': lnk}).subscribe((datax) => {
        this.links_tick = datax;
        this.links_tick_lst = this.links_tick[this.data['tick']];
      },
      error => {
        this.err_msg = error['statusText'];

      });
    }

    onNoClick(): void {
      this.dialogRef.close();
    }


}
