/**
 * Created by SIRIUS on 26.03.2017.
 */
 /*
Если вы добавите службу к каждому компоненту, каждый компонент получит другой экземпляр службы. Либо добавьте его к поставщикам компонента, который является родителем обоих, или добавьте к поставщикам @NgModule (), тогда один экземпляр службы будет использоваться всем приложением.
 */
import { Component, Input, OnDestroy, AfterViewInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';

import { HttpService } from '../../shared/HttpService';
import { RPCConnectionService } from '../../shared/rpc.connection.service';

import { Subscription } from "rxjs/Subscription";

//declare var $:any;
//declare function USRPCConnection( args: any ) : any;
    //declare function USRPCConnection_cb_gotRemoteStream() : void;
    //declare function USSocket_closeRoom() : void;
//declare function USRPCConnection_chatmessage() : void;
//declare function USRPCConnection_disconnect() : void;

//declare var creator:boolean;

@Component({
    selector: 'room-component',
    /*providers: [ HttpService ],*/
    styleUrls: [ './room.component.css' ],
    //templateUrl: './room.component.html'
    template:`
        <h1>ROOM COMPONENT</h1>
<div class="container video-container" style="padding-top: 12px;">
    <div class="row">
        <div class="col-md-9">
            <video id="remoteVideo" autoplay></video>
            <button class="btn btn-default" (click)="toggleAudio()">Audio</button>
            <button class="btn btn-default" (click)="toggleVideo()">Video</button>
        </div>

        <div class="col-md-3">
            <video id="localVideo" autoplay muted></video>
            <!--<audio id="soundMessage" style="display: none"><source src="../sounds-message.mp3" type="audio/mpeg"></audio>-->
            <div class="chatWrapper" id="chatWrapper">
                <div class="chatBox" id="chatbox">
                    <form style="display:none;" action="nowhere" id="fileForm"><input name="file" type="file" id="fileinput"/></form> <!-- display:none; -->
                </div>
                <div class="chatForm-div">
                    <form id="chatForm" method="post" action="nowhere">
                        <div class="chatInput-label pull-left"  style="width:80%; margin:0;">
                            <input class="form-control" style="width:100%; margin:0; "  type="text" autocomplete="off" id="chatinput" disabled="disabled" /> <!-- disabled="disabled" -->
                            <a class="glyphicon glyphicon-open upload-disabled"></a>
                        </div>
                        <input  class="btn btn-default btn-md" type="submit" id="chatsend" style="width: 20%; margin:0;" value="Send" disabled="disabled" /> <!-- disabled="disabled" -->
                    </form>
                </div>
            </div>

        </div>
    </div>
</div>
    `
//
    //directives: [ HomeComponent ]
})
// button {{$values['chatbuttontext']}}

export class RoomComponent implements OnDestroy, AfterViewInit{
    //public roomData:any = {'roomid':0, create:0};
    //@Input("setData") setRoomData:any;
    //@Input('parentData') incomingData: string;
    //@Input() everySecond:any;
    //@Input() roomData: any;
    private roomData:any;
    private subscription: Subscription;
    private param: string;
    //private RPCConnection:any;
//private peerconnectionservice: PeerconnectionService
    constructor(
        private activatedRoute:ActivatedRoute,
        private http_service:HttpService,
        private rpc:RPCConnectionService

    ){
        //let roomD = this.home.getRoomData();
        this.roomData = {'roomid':'0', 'create':false};
        console.log( "RoomComponent", "roomData", this.roomData );
        /*let creator:boolean = true;
        var RPCConnection = new USRPCConnection();
        RPCConnection.init(creator, roomid);*/
        
        /*var pathname = window.location.pathname.split('/');
        var roomid = pathname[pathname.length - 1];
        console.log( "roomid", roomid );*/
        /*this.subscription = activatedRoute.queryParams.subscribe(
            (queryParam:any) => {
                this.param = queryParam['roomId'];
                console.log("qparam=", this.param);
            }
        );*/
    }

    setData( roomData:any ){
        console.log( "setRoomData roomData", roomData );
    }

    public everySecond( data ) { 
        console.log('second');
    }

    ngAfterViewInit(){
        //console.log("room component init");
        this.subscription = this.activatedRoute.params.subscribe(
            (uriParam:any) => {
                //this.param = queryParam['roomId'];
                //console.log("qparam=", this.param);
                this.roomData = {'roomid':uriParam['roomId'], 'create':false};

                this.http_service.getOptionByType({'type':'room'}).subscribe((systemoption) => {
                    //this.systemoption = data;
                    console.log( "systemoption", systemoption );
                    console.log( "session", "r=", sessionStorage.getItem( "roomid" ), "c=", sessionStorage.getItem( "create" ) );
                    if( sessionStorage.getItem( "roomid" ) != null && sessionStorage.getItem( "create" ) != null){
                        this.roomData.roomid = parseInt( sessionStorage.getItem( "roomid" ) );
                        this.roomData.create = ( sessionStorage.getItem( "create" ) == "true")? true : false;
                    }
                    //var creator = ( this.roomData.create == 1 )? true : false;
                    console.log( "this.roomData", this.roomData, "room" );

                    console.log( "this.rpc === ", this.rpc );
                    this.rpc.setSysOption( systemoption );
                    this.rpc.init( this.roomData.create, this.roomData.roomid );


                });
            }
        );
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
        console.log("room component destroy");
        if( sessionStorage.getItem( "roomid" ) != null && sessionStorage.getItem( "create" ) != null ){
          console.log( sessionStorage.getItem( "create" ) );
          //USRPCConnection_cb_gotRemoteStream();

//          USSocket_closeRoom();
          //this.RPCConnection.disconnect();
//          USRPCConnection_disconnect();
          this.http_service.getOptionByType({'roomid':sessionStorage.getItem( "roomid" )}).subscribe((data) => {
            console.log( "roomremove", data );
          });
        }
        //USRPCConnection_cb_gotRemoteStream
        sessionStorage.removeItem( "roomid" );
        sessionStorage.removeItem( "create" );
    }

    toggleAudio(): void {
        this.rpc.toggleAudio();
    }

    toggleVideo(): void {
        this.rpc.toggleVideo();
    }
}