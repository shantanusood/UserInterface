import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CoronaserviceService } from '../coronaservice.service';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {

  public towns = [];
  public townSelected = "shantanusood";
  username: string;
  roles: string;
  role_list: object[];
  data: object;
  outstanding: any;
  outstanding_bool: boolean = false;
  refreshed: number = 0;
  add = false;
  count:number = 0;

  //readonly baseUrl = "http://localhost:5000/";
  readonly baseUrl = "https://shantanusood.pythonanywhere.com/";

  type:string = "";

  constructor(private http: HttpClient, private ds: CoronaserviceService) {
    this.ds.current.subscribe(message => this.username = message);
    this.http.get('/assets/roles.json').subscribe((data) => {
      this.role_list = data as object[];
      this.role_list.forEach(d => {
        if(d['role']=='admin' || d['role']=='tenant'){
          this.towns.push(d['userid']);
        }
        if(d['userid']===this.username){
          this.roles = d['role'];
        }
      });
    });
  }
  ngOnInit() {
    this.ds.current.subscribe(message => this.username = message);

    this.http
      .get(
        this.baseUrl +
          "data/"+this.username+"/rental/history")
      .subscribe((data) => {
        this.data = data;
      });
      this.http
      .get(
        this.baseUrl +
          "data/"+this.username+"/rental/outstanding")
      .subscribe((data) => {
        this.outstanding = data;
        if(this.outstanding=='0'){
          this.outstanding_bool = true;
        }
      });
    }

    send(){
      this.http
      .get(
        this.baseUrl +
          "data/"+this.townSelected+"/rental/addquotes")
      .subscribe((data) => {
        this.data = data;
      });
    }
    onClickRefresh(){
      this.refreshed = this.refreshed + 1;
      this.http
      .get(
        this.baseUrl +
          "data/"+this.townSelected+"/rental/history")
      .subscribe((data) => {
        this.data = data;
      });
    }
    edit(){
      this.count = this.count + 1;
      if(this.count%2===0 || this.count===0){
        this.add = false;
      }else{
        this.add = true;
      }
    }
    editVals(){
      this.http
      .get(
        this.baseUrl +
          "data/"+this.townSelected+"/rental/editquotes/edit/"+
          (document.getElementById("due_date") as HTMLInputElement).value+"/"+
          (document.getElementById("paid_date") as HTMLInputElement).value+"/"+
          (document.getElementById("rent") as HTMLInputElement).value+"/"+
          (document.getElementById("utilities") as HTMLInputElement).value+"/"+
          (document.getElementById("late") as HTMLInputElement).value+"/"+
          (document.getElementById("add") as HTMLInputElement).value+"/"+
          (document.getElementById("total") as HTMLInputElement).value+"/"+
          (document.getElementById("status") as HTMLInputElement).value)
      .subscribe((data) => {
        console.log("edited");
      });

    }
    delete(due_date: String, paid_date: String, rent: String, utilities: String, late: String, additional: String, total: String, status: String){
      this.http
      .get(
        this.baseUrl +
          "data/"+this.townSelected+"/rental/editquotes/delete/"+due_date+"/"+paid_date+"/"+rent+"/"+utilities+"/"+late+"/"+additional+"/"+total+"/"+status)
      .subscribe((data) => {
        console.log("deleted");
      });

    }

}
