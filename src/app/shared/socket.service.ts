/**
 * Created by SIRIUS on 01.04.2017.
 */
import { Injectable } from '@angular/core';

import {Inject} from '@angular/core';

import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from "rxjs/Observable";

import { RPCConnectionService } from './rpc.connection.service';
import { API_localhost_url, API_remotehost_url } from "./constant.params.ts";

declare var $:any;

@Injectable()
export class SocketService {

    private headers = new Headers({'Content-Type': 'application/json'});
    private api_host_url:string;

    counter : number;
    roomid;
    creator;
    //private rpc:RPCConnectionService;
    //private rpcservice:RPCConnectionService;
    private rpcservice:any;
    public intervalReciveConnectMessage:any;
    private systemoption:any;

    constructor( 
        @Inject(Http) private http:Http 
        //@Inject(RPCConnectionService) private rpcservice:RPCConnectionService
    ) {
        //this.rpc = RPCConnectionService();
        // здесь создается копия сервиса, а нужен желательно тотже самый что используется
        // как это переписать бы
        //this.rpcservice = new RPCConnectionService();
        this.counter = 0;
        if ('production' === ENV) {
          //this.api_host_url = 'https://vchat.sergey-l.ukrsol.com/';
          this.api_host_url = API_remotehost_url;
        } else {
          //this.api_host_url = 'http://127.0.0.1:8000/';
          this.api_host_url = API_localhost_url;
        }
    }

    public setSysOption( systemoption:any, rpcservice:RPCConnectionService ){
        this.systemoption = systemoption;
        this.rpcservice = rpcservice;
    }

    public init(creator:boolean, roomid:number) {
        this.creator = creator;
        this.roomid = roomid;
        this.intervalReciveConnectMessage = null;
    }

    public _sendConnectMessage(message) {
        console.log("_sendConnectMessage message", message);
        //var SO = this;
        var smessage = [];
        if (message[0].type == 'offer' || message[0].type == 'answer') {
            smessage.push({sdp: message[0].sdp, type: message[0].type});
        }
        smessage.push(message[1]);
        var host = 0, srflx = 0, relay = 0;
        var hostPattern = /(typ host)/;
        var srflxPattern = /(typ srflx)/;
        var relayPattern = /(typ relay)/;
        for (var i = 0; i < message[1].candidates.length; i++)
        {
            if (hostPattern.test(message[1].candidates[i].candidate)) {
                host++;
            }
            if (srflxPattern.test(message[1].candidates[i].candidate)) {
                srflx++;
            }
            if (relayPattern.test(message[1].candidates[i].candidate)) {
                relay++;
            }
        }
        /*if (relay == 0 && this.creator) {
            $('#TurnModal').modal();
        }*/
        console.log('Candidates host: '+host+'; srflx(stun): '+srflx+'; relay(turn): '+relay+';');
        var isOffer = (this.creator) ? true : false;
        var data = {
            roomid : this.roomid,
            message : smessage,
            dataType: 'JSON',
            isOffer : isOffer
        };

        console.log("Next Object will be send to server:");
        console.log(data);

        // Sending candidates to server

        /*$.ajax({
            //url: '/laravel/public/addmessage',
            url: this.api_host_url+'addmessage',
            method: 'post',
            data: data,
            error: function(err) {
                console.log("sendConnectMessage: error:", err);
            },
            success: function (success) {
                if (this.creator) {
                    console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Creator)");
                } else {
                    console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Opponent)");
                }
            }
        });*/
/*
        const params = JSON.stringify( data );
        return this.http.post(this.api_host_url+"addmessage/", params, {
            headers: this.headers
        })
        .map((data: Response) =>{
            if (this.creator) {
                console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Creator)");
            } else {
                console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Opponent)");
            }
            return data.json();
        })
        .catch(this.handlerError);
*/
        const params = JSON.stringify( data );
        return this.http.post(this.api_host_url+"addmessage/", params, {
            headers: this.headers
        })
        .map((data: Response) =>{
            return data.json();
        })
        .catch((err) => { 
            console.log('_sendConnectMessage Error: %s', err);
            return Observable.throw( err );
        })
        .subscribe( (data) => {
            if (this.creator) {
                console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Creator)");
            } else {
                console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Opponent)");
            }
        });
        // .toPromise()
        // .then((data: Response) => {
        //     console.log('sendConnectMessage Data: %s', data.json());
        //     if (this.creator) {
        //         console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Creator)");
        //     } else {
        //         console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Opponent)");
        //     }
        //     return data.json();
        // })
        // .catch((err) => console.log('sendConnectMessage Error: %s', err));
        // .map((data: Response) =>{
        //     if (this.creator) {
        //         console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Creator)");
        //     } else {
        //         console.log("sendConnectMessage: Offer and Candidates sent to server Sucessfuly (Opponent)");
        //     }
        //     return data.json();
        // })
        // .toPromise()
        // .catch(this.handlerError);


    }

    public _reciveConnectMessage() {
        //var SO = this;

        console.log("reciveConnectMessage - starting...");
        var offer = (!this.creator) ? true : false;

        //var interval = setInterval( function (){
        this.intervalReciveConnectMessage = setInterval( () => {
            //console.log("reciveConnectMessage... test THIS", this);

            // var data = {};
            // data.roomid = SO.roomid;
            // data.offer = offer;


            /*$.ajax({
                //url: '/laravel/public/getmessage',
                url: this.api_host_url+'getmessage',
                method: 'post',
                data: {
                    roomid : this.roomid,
                    offer : offer,
                },
                error: function (err) {
                    console.log(err);
                },
                success: function (sdata) {
                    if (sdata != "") {
                        //clearInterval(interval);
                        clearInterval( this.intervalReciveConnectMessage );
                        console.log($.parseJSON(sdata));
                        //this.RPC.connect($.parseJSON(sdata));
                        this.rpc.connect( $.parseJSON(sdata) );
                    }
                }
             });*/
/*
            const params = JSON.stringify( {roomid : this.roomid, offer : offer} );
            return this.http.post(this.api_host_url+"getmessage/", params, {
                headers: this.headers
            })
            .map((data: Response) =>{
                let json_data = data.json();
                if (json_data != "") {
                    //clearInterval(interval);
                    clearInterval( this.intervalReciveConnectMessage );
                    console.log(json_data);
                    //this.RPC.connect(json_data);
                    this.rpc.connect( json_data );
                }
                return data.json();
            })
            .catch(this.handlerError);
*/
            const params = JSON.stringify( {'roomid' : this.roomid, 'offer' : offer} );
            return this.http.post(this.api_host_url+"getmessage/", params, {
                headers: this.headers
            })
            .map((data: Response) =>{
                return data.json();
            })
            .catch((err) => { 
                console.log('_reciveConnectMessage Error: %s', err);
                return Observable.throw( err );
            })
            .subscribe( (json_data) => {
                //let json_data = data.json();
                if (json_data != "") {
                    //clearInterval(interval);
                    clearInterval( this.intervalReciveConnectMessage );
                    console.log( "_reciveConnectMessage", json_data);
                    //this.RPC.connect(json_data);
                    //this.rpc.connect( json_data );
                    // исправил, нужно было декодировать строку и снова закодировать в json
                    this.rpcservice.connect( json_data ); // сюда прилетает строка (offer_message), а должен быть json надо понять почему
                }
            });

            // .toPromise()
            // .then((data: Response) => {
            //     console.log('reciveConnectMessage Data: %s', data.json());
            //     let json_data = data.json();
            //     if (json_data != "") {
            //         //clearInterval(interval);
            //         clearInterval( this.intervalReciveConnectMessage );
            //         console.log(json_data);
            //         //this.RPC.connect(json_data);
            //         this.rpc.connect( json_data );
            //     }
            //     return data.json();
            // })
            // .catch((err) => console.log('reciveConnectMessage Error: %s', err));
            // .map((data: Response) =>{
            //     let json_data = data.json();
            //     if (json_data != "") {
            //         //clearInterval(interval);
            //         clearInterval( this.intervalReciveConnectMessage );
            //         console.log(json_data);
            //         //this.RPC.connect(json_data);
            //         this.rpc.connect( json_data );
            //     }
            //     return data.json();
            // })
            // .toPromise()
            // .catch(this.handlerError);
        }, 5000);
    }

    public _closeRoom() {
        //var SO = window.USSocket;
        clearInterval( this.intervalReciveConnectMessage );
        var data = {roomid : this.roomid};

        /*$.ajax({
            //url:'/laravel/public/removeroom',
            url:this.api_host_url+'removeroom',
            method: 'post',
            data: data,
            error: function (err) {
                console.debug(err);
            },
            success: function (success) {
                console.log('Room closet');
            }
        });*/

        /*
        const params = JSON.stringify( data );
        return this.http.post(this.api_host_url+"removeroom/", params, {
            headers: this.headers
        })
            .map((rdata: Response) =>{
                console.log('Room closet');
                return rdata.json();
            })
            .catch(this.handlerError);
            */
        const params = JSON.stringify( data );
        return this.http.post(this.api_host_url+"removeroom/", params, {
            headers: this.headers
        })
        .map((rdata: Response) =>{            
            return rdata.json();
        })
        .catch((err) => { 
            console.log('_closeRoom Error: %s', err);
            return Observable.throw( err );
        })
        .subscribe( (data) => {
            console.log('Room closet');
        });
        // .toPromise()
        // .then((data: Response) => {
        //     console.log('closeRoom Data: %s', data.json());
        //     return data.json();
        // })
        // .catch((err) => console.log('closeRoom Error: %s', err));

        // .map((rdata: Response) =>{
        //     console.log('Room closet');
        //     return rdata.json();
        // })
        // .toPromise()
        // .catch(this.handlerError);

    }

    public _sendChatMessage(mtext) {
        //var SO = window.USSocket;

        var data = {
            creator: this.creator,
            text: mtext,
            roomid: this.roomid
        };
/*
        $.ajax({
            //url:'/laravel/public/addchatmessage',
            url:this.api_host_url+'addchatmessage',
            method: 'post',
            data: data,
            error: function (err) {
                console.debug(err);
            },
            success: function (success) {
                var myDate = new Date();
                console.log(myDate);
                var time_str = "'"+myDate+"'";
                let time:string[];
                time = time_str.split(" ");
                $('#chatbox').append('<div class="chat-text-owner chat-text"><span class="time">'+this.systemoption.ownersignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+mtext+'</span></div>');
                var chatbox = $('#chatbox');
                var height = chatbox[0].scrollHeight;
                chatbox.scrollTop(height);
            }
        });
        */

        /*
        const params = JSON.stringify( data );
        return this.http.post(this.api_host_url+"addchatmessage/", params, {
            headers: this.headers
        })
            .map((data: Response) =>{
                var myDate = new Date();
                console.log(myDate);
                var time = "'"+myDate+"'";
                time = time.split(" ");
                $('#chatbox').append('<div class="chat-text-owner chat-text"><span class="time">'+this.systemoption.ownersignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+mtext+'</span></div>');
                var chatbox = $('#chatbox');
                var height = chatbox[0].scrollHeight;
                chatbox.scrollTop(height);
                return data.json();
            })
            .catch(this.handlerError);
            */
        const params = JSON.stringify( data );
        return this.http.post(this.api_host_url+"addchatmessage/", params, {
            headers: this.headers
        })
        .map((data: Response) =>{
            return data.json();
        })
        .catch((err) => { 
            console.log('_sendChatMessage Error: %s', err);
            return Observable.throw( err );
        })
        .subscribe( (data) => {
            var myDate = new Date();
            console.log(myDate);
            var time_str = "'"+myDate+"'";
            let time:string[];
            time = time_str.split(" ");
            $('#chatbox').append('<div class="chat-text-owner chat-text"><span class="time">'+this.systemoption.ownersignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+mtext+'</span></div>');
            var chatbox = $('#chatbox');
            var height = chatbox[0].scrollHeight;
            chatbox.scrollTop(height);
        });

        // .toPromise()
        // .then((data: Response) => {
        //     console.log('sendChatMessage Data: %s', data.json());
        //     var myDate = new Date();
        //     console.log(myDate);
        //     var time_str = "'"+myDate+"'";
        //     let time:string[];
        //     time = time_str.split(" ");
        //     $('#chatbox').append('<div class="chat-text-owner chat-text"><span class="time">'+this.systemoption.ownersignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+mtext+'</span></div>');
        //     var chatbox = $('#chatbox');
        //     var height = chatbox[0].scrollHeight;
        //     chatbox.scrollTop(height);
        //     return data.json();
        // })
        // .catch((err) => console.log('sendChatMessage Error: %s', err));

        // .map((data: Response) =>{
        //     var myDate = new Date();
        //     console.log(myDate);
        //     var time_str = "'"+myDate+"'";
        //     let time:string[];
        //     time = time_str.split(" ");
        //     $('#chatbox').append('<div class="chat-text-owner chat-text"><span class="time">'+this.systemoption.ownersignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+mtext+'</span></div>');
        //     var chatbox = $('#chatbox');
        //     var height = chatbox[0].scrollHeight;
        //     chatbox.scrollTop(height);
        //     return data.json();
        // })
        // .toPromise()
        // .catch(this.handlerError);

    }




    public _getChatMessage() {
        //var SO = window.USSocket;
        //this.RPC.getmess();
        //this.rpc._getmess();
        this.rpcservice._getmess();
    }

    private handlerError(error:any){
        console.log( "error", error );
        return Observable.throw( error );
    }
}
