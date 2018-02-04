import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'login',
  templateUrl:'./login.Component.html'
})

export class LoginComponent implements OnInit{
  public title:string;

  constructor(){
    this.title = 'Identifícate';
  }

  ngOnInit(){
    console.log('Componente del login cargando..')
  }
}
