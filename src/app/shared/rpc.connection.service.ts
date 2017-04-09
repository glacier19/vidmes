/**
 * Created by SIRIUS on 01.04.2017.
 */

import { Injectable } from '@angular/core';

import {Inject} from '@angular/core';

import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from "rxjs/Observable";
import { SocketService } from "./socket.service";

import { API_localhost_url, API_remotehost_url } from "./constant.params.ts";

declare var $:any;

//this.PeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
//this.IceCandidate = window.RTCIceCandidate || window.RTCIceCandidate;
//this.SessionDescription = window.RTCSessionDescription || window.RTCSessionDescription;
//navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;

@Injectable()
export class RPCConnectionService {

    //public value = 'Angular 2';
    private headers = new Headers({'Content-Type': 'application/json'});
    private api_host_url:string;

    private systemoption:any;
    //private pc:RTCPeerConnection;
    private chanel;
    private creator;
    private roomid;
    //private socket : SocketService;
    private candidates 		= [];
    private createRoomTimeout 	= 5000;
    private last_time 			= "";
    private maxUploadSize:any; 		//= parseInt(this.systemoption.maxuploadsize);
    private sdpDescription;
    private browser;
    localStream:any;
    //private pc:any;
    //pc: RTCPeerConnection;
    pc:any;

    constructor( 
        //private http:Http, 
        @Inject(Http) private http:Http, 
        @Inject(SocketService) private socket:SocketService
    ) {
        console.log( "this.pc constructor", this.pc );
        this.browser = {
            mozilla: /firefox/i.test(navigator.userAgent),
            chrome: /chrom(e|ium)/i.test(navigator.userAgent)
        };
        if ('production' === ENV) {
          //this.api_host_url = 'https://vchat.sergey-l.ukrsol.com/';
          this.api_host_url = API_remotehost_url;
        } else {
          //this.api_host_url = 'http://127.0.0.1:8000/';
          this.api_host_url = API_localhost_url;
        }
    }

    public setSysOption( systemoption:any ){
        this.systemoption = systemoption;
        this.maxUploadSize = parseInt( systemoption.maxuploadsize );
    }

    public init(creator:boolean, roomid:number){
        this.creator = creator;
        this.roomid = roomid;

        this.socket.setSysOption( this.systemoption, this );
        this.socket.init(creator, roomid);

        // Confirmation on Tab/Room closing
//        RPC._closeTabConfirmation();

        // Hide video element for mobile devices
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
//            $('#localVideo').css('display', 'none');
        }

        // Is it creator ?
        if (this.creator)
        {	// Yes, it is creator
            console.log("_createRoom", "creator", this.creator);
            // Display room in 5 seconds
            //setTimeout(this._createRoom, this.createRoomTimeout);
            setTimeout((localMediaStream: MediaStream) => {
                this._createRoom();
            }, this.createRoomTimeout);
        }
        else
        {	// No, it is opponent
            console.log("reciveConnectMessage", "creator", this.creator);
            // Get offer & candidates from server
            this.socket._reciveConnectMessage();// reciveConnectMessage(); //connect
        }

        /*navigator.getUserMedia( { audio: true, video: true }, function(stream ){
            console.log( "THIS TEST =", this);
        }  , this._error);*/
        /*navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);*/

        navigator.getUserMedia(
            // constrains:
            //this.constraints,
            { audio: true, video: true },
            // success:
            (localMediaStream: MediaStream) => {
                //console.log( "THIS TEST =", this);
                this.localStream = localMediaStream;
                //this.stream = localMediaStream;
                //this.video.myVideo.nativeElement.src = URL.createObjectURL(this.stream);
                //document.getElementById("localVideo").src = URL.createObjectURL(localMediaStream);
                //console.log("window===", window.URL);
                try{
                    //document.getElementById("localVideo").src = window.URL.createObjectURL(localMediaStream);
                    $('#localVideo').attr('src', window.URL.createObjectURL(localMediaStream) );
                }catch(e){}
                

                var configuration = {
                    iceServers: [
                        {urls: "stun:stun.l.google.com:19302"},

                        {urls:"turn:23.251.135.55:3478?transport=udp",
                            username:"1456553819:897661722",
                            credential:"20FgAInAD/r/+cSv+JDrwri8tjA="},
                        {urls:"turn:23.251.135.55:3478?transport=tcp",
                            username:"1456553819:897661722",
                            credential:"20FgAInAD/r/+cSv+JDrwri8tjA="},
                        {urls:"turn:23.251.135.55:3479?transport=udp",
                            username:"1456553819:897661722",
                            credential:"20FgAInAD/r/+cSv+JDrwri8tjA="},
                        {urls:"turn:23.251.135.55:3479?transport=tcp",
                            username:"1456553819:897661722",
                            credential:"20FgAInAD/r/+cSv+JDrwri8tjA="},
                        {urls:"turn:numb.viagenie.ca",
                            username:"postakk1@gmail.com",
                            credential:"qwerty123"}
                    ]
                };

                var optionalRtpDataChannels = {
                    optional: [{ DtlsSrtpKeyAgreement: true },{
                        RtpDataChannels: true
                    }]
                };

                this.pc = new RTCPeerConnection( configuration );
                //console.log( "this.pc ===", this.pc );

                 this.pc.addStream( localMediaStream );

                 this.pc.onicecandidate = (event) => {
                     this._cb_gotIceCandidate(event); // cb_gotIceCandidate;
                 };
                 this.pc.oniceconnectionstatechange = (event) => {
                     this.cb_stateChange(event);
                 }

                 //pc.ondatachannel = openAnswerChannel;
                 this.pc.onaddstream = this._cb_gotRemoteStream; // cb_gotRemoteStream;

                 //if (creator == true)
                 if( this.creator == true ) {
                    this._sysmess('Waiting for oponent...');
                    this._createOffer();
                 } else {
                    this._sysmess('Connection...');
                 }

            },
            // error:
            (error) => { console.log('navigator.getUserMedia error: ', error); }
        );
        //this.cb_gotStream2();
        //this.cb_gotStream

        console.log('Am I Creator ? - '+this.creator);
    }

    _createRoom(){
        console.log("USRPCConnection_createRoom");
        var spdAndCandidates = [this.sdpDescription, {type: 'candidate',candidates :this.candidates}];
//console.log("spdAndCandidates=", spdAndCandidates, this, this.sdpDescription);
        // Hide preloader & display room
        // jQuery('.preloader').hide();
        // jQuery('.main-container').hide();
        // jQuery('.room-container').show();
//        RPC._ChangeUrl("/", "r/"+RPC.roomid);
//return false;
         // Sending candidates to server
         this.socket._sendConnectMessage(spdAndCandidates); // sendConnectMessage(spdAndCandidates);

         console.log("Room creation & Sending candidates ("+this.candidates.length+") (timeout "+this.createRoomTimeout+")");

         // Send email to opponent
         this._sendMail();

         // Getting offer & candidates from opponent
         this.socket._reciveConnectMessage(); // reciveConnectMessage();
    }

    _cb_gotIceCandidate(event) {
        //console.log(event.candidate);
        //console.log( "THIS TEST _cb_gotIceCandidate=", this, event);
        // Works perfectly in FF but in Chrome with delay in a fe mins
        if (event.candidate == null) {
            console.log('Last null candidate has been found.');
        }

        if (event.candidate) {
            this.candidates.push({
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        }
    }

    cb_stateChange(ev) {
        if(ev.target.iceConnectionState == 'disconnected') {
            console.log('connection disconnected');
            this.pc.close();
            //document.getElementById("localVideo").src = "";
            $('#localVideo').attr('src', "" );
            this.socket._closeRoom();
        };
    }

    _cb_gotRemoteStream(event){
        //public _cb_gotRemoteStream() {
//        document.getElementById("remoteVideo").src = URL.createObjectURL(event.stream);
        $('#remoteVideo').attr('src', URL.createObjectURL(event.stream) );
        //document.getElementById("remoteVideo").src = URL.createObjectURL( window.event.stream );
    }

    _sysmess(text) {
        var myDate = new Date();
        //console.log(myDate);
        var time_str = "'"+myDate+"'";
        let time:string[];
        time = time_str.split(" ");
        $('#chatbox').append('<div class="chat-text-system chat-text"><span class="time">'+this.systemoption.systemsignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+text+'</span></div>');
        var chatbox = $('#chatbox');
        var height = chatbox[0].scrollHeight;
        chatbox.scrollTop(height);
    }

    // Step 2. createOffer
    _createOffer() {
        var options = (this.browser.mozilla) ? {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true} : { 'mandatory': {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true} };
        this.pc.createOffer(
            (description) => {
                this._gotLocalDescription(description)
            },
            (error) => { console.log('_createOffer error: ', error); },
            options
        );
    }

    _gotLocalDescription(description) {
        this.pc.setLocalDescription(description);
        //console.log(description);
        //RPC.socket.sendConnectMessage(description);
        this.sdpDescription = description;
    }

    _sendMail() {
        //var RPC = this;
/*
        $.ajax({
            type: 'post',
            //url: '/laravel/public/sendMail',
            url: this.api_host_url+'sendMail',
            data: {roomid: this.roomid, url:window.location.href},
            dataType: "JSON",
            error : this._error,// error,
            success: function (result) {
                console.log('Email sent');
            }
        });
*/
        // const params = JSON.stringify( {roomid: this.roomid, url:window.location.href} );
        // return this.http.post(this.api_host_url+"sendMail/", params, {
        //     headers: this.headers
        // })

        // .map((data: Response) =>{
        //     console.log('sendMail Data: %s', data.json());
        //     return data.json();
        // })
        // .catch((err) => { 
        //     console.log('sendMail Error: %s', err);
        //     return Observable.throw( err );
        // })
        // .subscribe();
        //.catch(this.handlerError);


        // .toPromise()
        // .then((data: Response) => {
        //     console.log('sendMail Data: %s', data.json());
        //     return data.json();
        // })
        // .catch((err) => console.log('sendMail Error: %s', err));
        console.log(" sendMail sendMail sendMail");

        const params = JSON.stringify( {'roomid': this.roomid, 'url':window.location.href} );
        return this.http.post(this.api_host_url+"sendMail/", params, {
            headers: this.headers
        })

        .map((data: Response) =>{
            console.log('sendMail Data: %s', data.json());
            return data.json();
        })
        .toPromise()
        .then((data: Response) => {
            console.log('sendMail Data: %s', data);
            return data;
        })
        .catch((err) => console.log('sendMail Error: %s', err));

    }
// ****************************
// Sending File
    public _sendFile() {
        //var RPC = this;

        var dropZone  = $('#chatWrapper');
        var choseElem = $('.glyphicon-open');
        var fileinput = $('#fileinput');
        dropZone.on('dragenter', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
        });
        dropZone.on('dragover', (evt) => {
            console.log( "*** FILE UPLOAD HOVER ***" );
            evt.stopPropagation();
            evt.preventDefault();
        });
        dropZone.on('drop', (evt) => {
            evt.preventDefault();
            var files = evt.originalEvent.dataTransfer.files;

            //We need to send dropped files to Server
            this._handleFileUpload( files, dropZone );
        });
        fileinput.on('change', (evt) => {
            this._handleFileUpload( evt.target.files,choseElem );
        });
        choseElem.click( () => { fileinput.click(); });

        $(document).on('dragenter', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
        });
        $(document).on('dragover', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
        });
        $(document).on('drop', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
        });
    }

// handle File Upload
    public _handleFileUpload( files, dropZone ) {
        if(dropZone[0].localName == 'a') {
            var errclass = 'glyphicon-open-error';
            var sacClass = 'glyphicon-open-sucess';
        } else {
            var errclass = 'dropZone-error';
            var sacClass = 'dropZone-sucess';
        }

        if (files.length > 1) {
            this._sysmess(this.systemoption.multifiletext);
            dropZone.addClass(errclass);
            setTimeout( () => { dropZone.removeClass(errclass); },2000);
        } else if (files[0].size > this.maxUploadSize) {
            this._sysmess(this.systemoption.largefiletext);
            dropZone.addClass(errclass);
            setTimeout( () => { dropZone.removeClass(errclass); },2000);
        } else {
            var formData = new FormData();

            $.each(files, function (i, file){
                formData.append(i, file);
            });

            formData.append("roomid", this.roomid);
            //formData.append("creator", creator);
            formData.append("creator", this.creator);

            /*$.ajax({
                type: 'POST',
                //url: '/laravel/public/upload',
                url: this.api_host_url+'upload',
                data: formData,
                dataType: "JSON",
                cache: false,
                processData: false,
                contentType: false,
                success: function (result) {
                    this._sysmess('File sent');
                    dropZone.addClass(sacClass);
                    setTimeout(() => { dropZone.removeClass('success'); },2000);
                }
            });*/
/*
            const params = JSON.stringify( formData );
            this.http.post(this.api_host_url+"upload/", params, {
                headers: this.headers
            })            
            .map((data: Response) =>{
                //console.log( "data json", data.json() );
                this._sysmess('File sent');
                dropZone.addClass(sacClass);
                setTimeout( () => { dropZone.removeClass('success'); },2000);
                    return data.json();
            })
            .catch(this.handlerError);
*/
            const params = JSON.stringify( formData );
            this.http.post(this.api_host_url+"upload/", params, {
                headers: this.headers
            })
            .map((data: Response) =>{
                return data.json();
            })
            .catch((err) => { 
                console.log('_handleFileUpload Error: %s', err);
                return Observable.throw( err );
            })
            .subscribe( (data) => {
                this._sysmess('File sent');
                dropZone.addClass(sacClass);
                setTimeout( () => { dropZone.removeClass('success'); },2000);
            });

            // .toPromise()
            // .then((data: Response) => {
            //     console.log('handleFileUpload Data: %s', data.json());
            //     return data.json();
            // })
            // .catch((err) => console.log('handleFileUpload Error: %s', err));
            // .map((data: Response) =>{
            //     //console.log( "data json", data.json() );
            //     this._sysmess('File sent');
            //     dropZone.addClass(sacClass);
            //     setTimeout( () => { dropZone.removeClass('success'); },2000);
            //         return data.json();
            // })
            // .toPromise()
            // .catch(this.handlerError);

        }
    }

    public _chatmessage() {
        $('#chatForm').submit( (event) => {
            //console.log( "message sent" );
            console.log( "*** MESSAGE SENT ***" );

            var input = $('#chatinput');

            if (input.val() != "") {
                this.socket._sendChatMessage(input.val()); // sendChatMessage(input.val());
                input.val("");
            }
            event.preventDefault();
        });
        /*$('#chatsend').on('click', function(){
         console.log( "*** MESSAGE SENT ***" );
         });*/
    }

// Step 3. createAnswer
    public _createAnswer() {
        var options = (this.browser.mozilla) ? {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true} : { 'mandatory': {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true} };
        this.pc.createAnswer(
            (description) => {
                this._gotLocalDescription(description)
            },
            (error) => { console.log('_createAnswer error: ', error); },
            options
        );
    }

    public connect(messages) {
        for (var index in messages) {
            var message = messages[index];

            if (this.creator == false && message.type === 'offer') {
                //this.pc.setRemoteDescription(new SessionDescription(message), () => { this._createAnswer(); setTimeout( () => {                
                this.pc.setRemoteDescription(new RTCSessionDescription(message), () => { this._createAnswer(); setTimeout( () => {
                    var spdAndCandidates = [this.sdpDescription, {type: 'candidate',candidates : this.candidates}];

                    // вот фигня this.socket._sendChatMessage(spdAndCandidates); //sendConnectMessage(spdAndCandidates);
                    this.socket._sendConnectMessage(spdAndCandidates);
                }, 1000)}, this._error);
                this._sysmess('Connected');
                this._sendFile();
                this._chatmessage();

                this.socket._getChatMessage(); // getChatMessage();
                $('#chatinput, #chatsend').attr('disabled', false);
                $('.glyphicon-open').removeClass('upload-disabled');

            } else if (this.creator == true && message.type === 'answer') {
                //this.pc.setRemoteDescription(new SessionDescription(message));
                this.pc.setRemoteDescription(new RTCSessionDescription(message));
                this._sysmess('Connected!');
                this._chatmessage();
                this._sendFile();
                this.socket._getChatMessage(); //getChatMessage();
                $('#chatinput, #chatsend').attr('disabled', false);
                $('.glyphicon-open').removeClass('upload-disabled');
            }
        }
        for (var index in messages) {
            message = messages[index];
            console.log(message);
            if (message.type === 'candidate') {
                for (var i = 0; i < message.candidates.length; i++) {
                    //var candidate = new IceCandidate({sdpMLineIndex: message.candidates[i].label, candidate: message.candidates[i].candidate, sdpMid: message.candidates[i].id});
                    var candidate = new RTCIceCandidate({sdpMLineIndex: message.candidates[i].label, candidate: message.candidates[i].candidate, sdpMid: message.candidates[i].id});
                    console.log("RTCIceCandidate = ", candidate);
                    this.pc.addIceCandidate(candidate);
                }
            }
        }
    }

    public _getmess() {
        //var RPC = window.USRPCConnection;

        /*$.ajax({
            //url:'/laravel/public/getchatmessage',
            url:this.api_host_url+'getchatmessage',
            dataType: 'json',
            method: 'post',
            data: {
                //creator:creator,
                creator:this.creator,
                roomid:this.roomid,
                lasttime:this.last_time
            },
            error: function (err) {
                //setTimeout('window.USRPCConnection.getmess()',2000);
                setTimeout( () => { this._getmess() } ,2000);
                this._error(err);
            },
            success: function (messages) {
                this.last_time = messages.last_mess_time;
                //setTimeout('window.USRPCConnection.getmess()',2000);
                setTimeout( () => { this._getmess() } ,2000);
                if (messages.messages.length > 0) {
                    $.each(messages.messages, function (index) {
                        var myDate = new Date();
                        var time_str = "'"+myDate+"'";
                        let time:string[];
                        time = time_str.split(" ");
                        $('#chatbox').append('<div class="chat-text-oponent chat-text"><span class="time">'+this.systemoption.oponentsignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+messages.messages[index].message_text+'</span></div>');
                        var chatbox = $('#chatbox');
                        var patforfile = /<span data-type="file"><\/span>/;
                        if (patforfile.test(messages.messages[index].message_text)) {
                            $('#fileModal .modal-body #fileLinkSpan').html(messages.messages[index].message_text);
                            //$('#fileModal').modal();
                            this._afterDownloadFile();
                        }
                        $('#soundMessage')[0].play();
                        var height = chatbox[0].scrollHeight;
                        chatbox.scrollTop(height);
                    });
                }
            }
        });*/
/*
        const params = JSON.stringify( {
            //creator:creator,
            creator:this.creator,
            roomid:this.roomid,
            lasttime:this.last_time
        } );
        return this.http.post(this.api_host_url+"getchatmessage/", params, {
            headers: this.headers
        })
        .map((messages: Response) =>{
            messages.json()
            this.last_time = messages.last_mess_time;
            //setTimeout('window.USRPCConnection.getmess()',2000);
            setTimeout( () => { this._getmess() } ,2000);
            if (messages.messages.length > 0) {
                $.each(messages.messages, (index) => {
                    var myDate = new Date();

                    var time_str = "'"+myDate+"'";
                    let time:string[];
                    time = time_str.split(" ");
                    $('#chatbox').append('<div class="chat-text-oponent chat-text"><span class="time">'+this.systemoption.oponentsignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+messages.messages[index].message_text+'</span></div>');
                    var chatbox = $('#chatbox');
                    var patforfile = /<span data-type="file"><\/span>/;
                    if (patforfile.test(messages.messages[index].message_text)) {
                        $('#fileModal .modal-body #fileLinkSpan').html(messages.messages[index].message_text);
                        //$('#fileModal').modal();
                        this._afterDownloadFile();
                    }
//                        $('#soundMessage')[0].play();
                    var height = chatbox[0].scrollHeight;
                    chatbox.scrollTop(height);
                });
            }
            return messages.json();
        })
        .catch(this.handlerError);
*/
        const params = JSON.stringify( {
            //creator:creator,
            creator:this.creator,
            roomid:this.roomid,
            lasttime:this.last_time
        } );
        return this.http.post(this.api_host_url+"getchatmessage/", params, {
            headers: this.headers
        })
        .map((messages: Response) =>{
            return messages.json();
        })
        .catch((err) => { 
            console.log('_getmess Error: %s', err);
            return Observable.throw( err );
        })
        .subscribe( (messages_json) => {
            //let messages_json = messages.json();
            this.last_time = messages_json.last_mess_time;
            //setTimeout('window.USRPCConnection.getmess()',2000);
            setTimeout( () => { this._getmess() } ,2000);
            if (messages_json.messages.length > 0) {
                $.each(messages_json.messages, (index) => {
                    var myDate = new Date();
                    var time_str = "'"+myDate+"'";
                    let time:string[];
                    time = time_str.split(" ");
                    $('#chatbox').append('<div class="chat-text-oponent chat-text"><span class="time">'+this.systemoption.oponentsignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+messages_json.messages[index].message_text+'</span></div>');
                    var chatbox = $('#chatbox');
                    var patforfile = /<span data-type="file"><\/span>/;
                    if (patforfile.test(messages_json.messages[index].message_text)) {
                        $('#fileModal .modal-body #fileLinkSpan').html(messages_json.messages[index].message_text);
                        //$('#fileModal').modal();
                        this._afterDownloadFile();
                    }
//                        $('#soundMessage')[0].play();
                    var height = chatbox[0].scrollHeight;
                    chatbox.scrollTop(height);
                });
            }
        });

        // .toPromise()
        // .then((messages: Response) => {
        //     console.log('getmess Data: %s', messages.json());
        //     let messages_json = messages.json();
        //     this.last_time = messages_json.last_mess_time;
        //     //setTimeout('window.USRPCConnection.getmess()',2000);
        //     setTimeout( () => { this._getmess() } ,2000);
        //     if (messages_json.messages.length > 0) {
        //         $.each(messages_json.messages, (index) => {
        //             var myDate = new Date();

        //             var time_str = "'"+myDate+"'";
        //             let time:string[];
        //             time = time_str.split(" ");
        //             $('#chatbox').append('<div class="chat-text-oponent chat-text"><span class="time">'+this.systemoption.oponentsignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+messages_json.messages[index].message_text+'</span></div>');
        //             var chatbox = $('#chatbox');
        //             var patforfile = /<span data-type="file"><\/span>/;
        //             if (patforfile.test(messages_json.messages[index].message_text)) {
        //                 $('#fileModal .modal-body #fileLinkSpan').html(messages_json.messages[index].message_text);
        //                 //$('#fileModal').modal();
        //                 this._afterDownloadFile();
        //             }
        //             // $('#soundMessage')[0].play();
        //             var height = chatbox[0].scrollHeight;
        //             chatbox.scrollTop(height);
        //         });
        //     }
        //     return messages.json();
        // })
        // .catch((err) => console.log('getmess Error: %s', err));

//         .map((messages: Response) =>{
//             let messages_json = messages.json();
//             this.last_time = messages_json.last_mess_time;
//             //setTimeout('window.USRPCConnection.getmess()',2000);
//             setTimeout( () => { this._getmess() } ,2000);
//             if (messages_json.messages.length > 0) {
//                 $.each(messages_json.messages, (index) => {
//                     var myDate = new Date();

//                     var time_str = "'"+myDate+"'";
//                     let time:string[];
//                     time = time_str.split(" ");
//                     $('#chatbox').append('<div class="chat-text-oponent chat-text"><span class="time">'+this.systemoption.oponentsignature+' ['+time[4]+']:&nbsp;</span><span class="text">'+messages_json.messages[index].message_text+'</span></div>');
//                     var chatbox = $('#chatbox');
//                     var patforfile = /<span data-type="file"><\/span>/;
//                     if (patforfile.test(messages_json.messages[index].message_text)) {
//                         $('#fileModal .modal-body #fileLinkSpan').html(messages_json.messages[index].message_text);
//                         //$('#fileModal').modal();
//                         this._afterDownloadFile();
//                     }
// //                        $('#soundMessage')[0].play();
//                     var height = chatbox[0].scrollHeight;
//                     chatbox.scrollTop(height);
//                 });
//             }
//             return messages.json();
//         })
//         .toPromise()
//         .catch(this.handlerError);
    }

    _disconnect(){
        //var RPC = window.USRPCConnection;
        //if(ev.target.iceConnectionState == 'disconnected')
        //{
        console.log('connection disconnected');
        this.pc.close();
        try{
            //document.getElementById("localVideo").src = "";
            //document.getElementById("remoteVideo").src = "";

            $('#localVideo').attr('src', "" );
            $('#remoteVideo').attr('src', "" );
        }catch(e){}
        this.socket._closeRoom();
        //};
        this.closeConnection();
    }

    closeConnection(): void {
        this.pc.oniceconnectionstatechange = () => {};
        this.localStream.stop();
        this.localStream = null;
        //localStream.stop(); localStream = null;
        // close dc if it is not already closed
        if (this.pc && (this.pc.signalingState !== 'closed')) {
            this.pc.close();
            //this.store.dispatch({ type: 'CONNECTION_CLOSED' });
            //this.store.dispatch({ type: 'CALL_ENDED' });
        }
    }

    _afterDownloadFile() {
        //$('#fileLinkSpan').click(function () {$('#fileModal').modal('hide');});
    }
// **********************************
    toggleAudio(): void {
        let audioTracks = this.localStream.getAudioTracks();
        for (let i = 0, l = audioTracks.length; i < l; i++) {
            audioTracks[i].enabled = !audioTracks[i].enabled;
        }
    }

    toggleVideo(): void {
        let videoTracks = this.localStream.getVideoTracks();
        for (let i = 0, l = videoTracks.length; i < l; i++) {
            videoTracks[i].enabled = !videoTracks[i].enabled;
        }
    }










































    _error(message) {
        console.log(message);
    }

    private handlerError(error:any){
        console.log( "error", error );
        return Observable.throw( error );
    }
}