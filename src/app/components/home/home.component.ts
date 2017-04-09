import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute  } from '@angular/router';

//import { RoomComponent } from '../components/room/room.component';
import { HttpService } from '../../shared/HttpService';

//declare var $:any;
//declare function USRPCConnection( args: any ) : any;
//declare function USRPCConnection_cb_gotRemoteStream(): void;

/*
http://stackoverflow.com/questions/37904023/how-to-use-webrtc-in-angular-2
https://github.com/webrtc/adapter
пример WEBRTC под angular 2
https://github.com/fmoessle/angular2-webrtc
*/


@Component({
  selector: 'home',
  /*providers: [ HttpService ],*/
  styleUrls: [ './home.component.css' ],
  //templateUrl: './home.component.html'
  //declarations:[ RoomComponent ]
  template:`
<div class="row">
  <div class="col-md-4 col-sm-offset-4">
    <form class="form-signin" (ngSubmit)="onSubmitInviteForm()" [formGroup]="inviteForm"> <!-- [formGroup]="inviteForm" -->
      <h2 class="form-signin-heading">Enter oponent email</h2>
      <div class="form-group"> <!-- id="inputEmail" -->
        <label class="sr-only">Email address</label>
        <input type="email" formControlName="inputEmail"
        class="form-control" placeholder="Email address" required autofocus> <!-- formControlName="inputEmail" -->
        <div *ngIf="!inviteForm.get(['inputEmail']).valid">
        </div>
        <!--<div [hidden]="inputEmail.valid || inputEmail.pristine">-->
          <!--Invalid Email-->
        <!--</div>-->
      </div>

      <div class="form-group">
        <button class="btn btn-lg btn-primary btn-block" type="submit" [disabled]="!inviteForm.valid">send</button>
      </div>
    </form>
    <p>Form value: {{ inviteForm.value | json }}</p>
    <p>Form status: {{ inviteForm.status | json }}</p>
  </div>

</div>
  `
})
export class HomeComponent implements OnInit, AfterViewInit  {
  @Output() setRoomData = new EventEmitter();
  //@Output('everySecond') everysecond = new EventEmitter();
  //@Output('childData') outgoingData = new EventEmitter<string>();

  public localState = { value: '' };
  public systemoption:any;
  
  private inviteForm:FormGroup;
  private roomData:any;

// https://angular.io/docs/ts/latest/guide/forms.html
// http://stackoverflow.com/tags/angular2-formbuilder/hot
// https://metanit.com/web/angular2/5.5.php
  constructor(
    //private formBuilder:FormBuilder
    private http_service:HttpService,
    private fb: FormBuilder,
    private router: Router
    //private room:RoomComponent
  ) {
        let pattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        this.inviteForm = fb.group({
          //inputEmail: new FormControl()
            'inputEmail':['',[
              Validators.required,
              //Validators.pattern("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")
              //Validators.pattern("(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))")
              Validators.pattern(pattern)
            ]]
        });
  }

  public ngOnInit() {
    /*this.http_service.getOptionByType({'type':'home'}).subscribe((data) => {
      this.systemoption = data;
      console.log( "systemoption", this.systemoption );
    });*/
  }
  
  onSubmitInviteForm(){
    console.log(this.inviteForm);
    //console.log("values=", this.inviteForm.value);
    let room_email = this.inviteForm.get('inputEmail').value;
    this.createRoom( room_email );
    //this.createRoomJQ( room_email );
  }
  
  createRoom( room_email ){
    this.http_service.createRoomRequest( room_email ).subscribe((data) => {
      //this.systemoption = data;
      console.log( "data", data );
      if( data.create == true || data.create == 'true' ){
        console.log( "emit data" );
        //this.router.navigate(['/room'], {queryParams:{'analytics':100}});
        this.roomData = data;
        //this.router.navigateByUrl("/room/"+data.rooomid, { skipLocationChange: true });
//        this.router.navigateByUrl("/room/"+data.roomid);

        sessionStorage.setItem( "roomid", this.roomData.roomid );
        sessionStorage.setItem( "create", this.roomData.create );

        console.log( "this.roomData", this.roomData, "home" );
        this.router.navigate(['/r', this.roomData.roomid]);
      }
    });
  }

  ngAfterViewInit(){
    console.log("home component view init");
  }
// ***********************************
  createRoomJQ( room_email ){
    //console.log( room_email );
    let data = this.http_service.createRoomRequestPR( room_email );
    console.log( "data", data );
    this.http_service.createRoomJQ( room_email );

    //   console.log( "data", data );
    //   if( data.create == true || data.create == 'true' ){
    //     console.log( "emit data" );
    //     this.roomData = data;

    //     sessionStorage.setItem( "roomid", this.roomData.roomid );
    //     sessionStorage.setItem( "create", this.roomData.create );

    //     console.log( "this.roomData", this.roomData, "home" );
    //     this.router.navigate(['/r', this.roomData.roomid]);
    //   }
  }

  
}
