// SERVICIO - Clase con metodos que van a interactuar con servicio REST

import { Injectable } from '@angular/core'; // permite definir los servicios e inyectarlos en otra clase
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable'; // para recoger las respuestas del api
import { User } from '../models/user'; // modelo de usuario

import { GLOBAL } from './global';

@Injectable()
export class UserService{
  public url:string; // tendremos la url del backend localhost/3800
  public identity;
  public token;
  public stats;

  constructor(public _http: HttpClient) { //definimos la pripiedad hhtp para hacer peticiones
    this.url = GLOBAL.url;
  }

  register(user: User): Observable<any>{
    //método, ponemos any si no sabemos le tipo de dato que va a devolver,
    // por si no lo tenemos definido en el modelo nos curamos en salud

    let params = JSON.stringify(user); // json convertido a string
    // convertimos el objeto que llega por parametro a un objeto json en formato string

    let headers = new HttpHeaders().set('Content-Type', 'application/json'); // configuramos las cabeceras

    return this._http.post(this.url+'register', params, {headers:headers});
    //console.log(user_to_register);
    //console.log(this.url);
  }

  signup(user, gettoken = null): Observable<any>{
    if(gettoken != null){
      user.gettoken = gettoken; // la variable gettoken nos llega por parámetro
    }

    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type','application/json');

    return this._http.post(this.url+'login', params, {headers: headers})
  }

  getIdentity(){
    let identity = JSON.parse(localStorage.getItem('identity')); // convierto el string de identity a objeto JSON

    if(identity != "undefined"){
      this.identity = identity;
    }else{
      this.identity = null;
    }
      return this.identity;
    }

  getToken(){
    let token = localStorage.getItem('token');

    if(token != "undefined"){
      this.token = token;
    }else{
      this.token = null;
    }

    return this.token;
  }

  getStats(){
    let stats = JSON.parse(localStorage.getItem('stats'));

    if(stats != "undefined"){
      this.stats = stats;
    }else{
      this.stats = null;
    }
    return this.stats;
  }

  getCounters(userId = null): Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json')
                                   .set('Authorization',this.getToken());

    if(userId =! null){
      return this._http.get(this.url+'counters/'+userId, {headers: headers});
    }else{
      return this._http.get(this.url+'counters/', {headers: headers});
    }

  }

}
