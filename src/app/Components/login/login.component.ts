import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'login',
  templateUrl:'./login.Component.html',
  providers: [UserService]
})

export class LoginComponent implements OnInit{
  public title:string; // Propiedades
  public user:User;
  public status:string;
  public identity;
  public token;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ){
    this.title = 'Identifícate';
    this.user = new User("",
    "",
    "",
    "",
    "",
    "ROLE_USER",
    "");
  }

  ngOnInit(){
    console.log('Componente del login cargando..')
  }
  onSubmit(){
    //alert(this.user.email)
    //alert(this.user.password)
    //console.log(this.user);

    // LOGUEAR AL USUARIO Y CONSEGUIR SUS DATOS
    this._userService.signup(this.user).subscribe(
    response => {
      this.identity = response.user;

      if(!this.identity || !this.identity._id){
        this.status = 'error';
      }else{
        this.status = 'success';
        // PERSISTIR DATOS DEL USUARIO

        // CONSEGUIR TOKEN
      }      
    },
    error => {
      var errorMessage = <any>error;
      // console.log(errorMessage);

      if(errorMessage != null){
        this.status = 'error';
      }
    }
  )
  }
}
