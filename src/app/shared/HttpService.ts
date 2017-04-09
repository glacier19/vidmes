import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from "rxjs/Observable";
import { API_localhost_url, API_remotehost_url } from "./constant.params.ts";

declare var $:any;

@Injectable()
export class HttpService {

  //public value = 'Angular 2';
  private headers = new Headers({'Content-Type':'application/json'});
  private api_host_url:string;

  constructor(
    private http: Http
  ) {
    if ('production' === ENV) {
      //this.api_host_url = 'https://vchat.sergey-l.ukrsol.com/';
      this.api_host_url = API_remotehost_url;
    } else {
      //this.api_host_url = 'http://127.0.0.1:8000/';
      this.api_host_url = API_localhost_url;
    }
  }

  /*public getData() {
    console.log('Title#getData(): Get Data');
    // return this.http.get('/assets/data.json')
    // .map(res => res.json());
    return {
      value: 'AngularClass'
    };
  }*/

  public getPageData(page_url:any){
    const params = JSON.stringify( page_url );
    return this.http.post(this.api_host_url, params, {
      headers: this.headers
    })
        .map((data: Response) =>{
          console.log( "data json", data.json() );
          return data.json();
        })
        .catch(this.handlerError);
  }

  public getOptionByType( type_option:any ){
      const params = JSON.stringify( type_option );
      return this.http.post(this.api_host_url+"getOptionByType/", params, {
        headers: this.headers
      })
      .map((data: Response) =>{
          //console.log( "data json", data.json() );
          return data.json();
      })
      .catch(this.handlerError);

      // const params = JSON.stringify( type_option );
      // return this.http.post(this.api_host_url+"getOptionByType/", params, {
      //   headers: this.headers
      // })
      // .map((data: Response) =>{
      //     //console.log( "data json", data.json() );
      //     return data.json();
      // })
      // .toPromise()
      // .then((data: Response) => {
      //     console.log('getOptionByType Data: %s', data.json());
      //     return data.json();
      // })
      // .catch((err) => console.log('createRoomRequest Error: %s', err));
  }

  createRoomRequest( email:string ){
      const params = JSON.stringify( {emailOponent:email} );
      return this.http.post(this.api_host_url+"create/", params, {
        headers: this.headers
      })
      .map((data: Response) =>{
        //console.log( "data json", data.json() );
        return data.json();
      })
      .catch(this.handlerError);

      // const params = JSON.stringify( {emailOponent:email} );
      // return this.http.post(this.api_host_url+"create/", params, {
      //   headers: this.headers
      // })
      // .map((data: Response) =>{
      //   //console.log( "data json", data.json() );
      //   return data.json();
      // })
      // .toPromise()
      // .then((data: Response) => {
      //     console.log('createRoomRequest Data: %s', data.json());
      //     return data.json();
      // })
      // .catch((err) => console.log('createRoomRequest Error: %s', err));
  }

  deleteRoomRequest( roomid:string ){
    const params = JSON.stringify( { roomid:roomid } );
    return this.http.post(this.api_host_url+"removeroom/", params, {
      headers: this.headers
    })
    .map((data: Response) =>{
      //console.log( "data json", data.json() );
      return data.json();
    })
    .catch(this.handlerError);
    //removeRoom
  }

  private handlerError(error:any){
      console.log( "error", error );
      return Observable.throw( error );
  }

// *************************************
  createRoomRequestPR( email:string ){
      const params = JSON.stringify( {emailOponent:email} );
      return this.http.post(this.api_host_url+"create/", params, {
        headers: this.headers
      })
      .map((data: Response) =>{
        return data.json();
      })
      .toPromise()
      .then((data: Response) => {
          console.log('AJAX SEND createRoomRequestJQ Data: %s', data);
          return data;
      })
      .catch((err) => console.log('createRoomRequestJQ Error: %s', err));
  }

  createRoomJQ( email:string ){
        $.ajax({
            type: 'post',
            url: this.api_host_url+'create/',
            data: {emailOponent:email},
            dataType: "JSON",
            error : function(){
              console.log('error createROOM JQ');
            },
            success: function (result) {
                console.log('createROOM JQ');
            }
        });
  }
}