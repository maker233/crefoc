import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'register',
  templateUrl:'./register.Component.html',
  providers: [UserService] // aqui cargamos los servicios
})

export class RegisterComponent implements OnInit{
  public title:string;
  public user: User;
  public status:string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService // Para inyectar el servicio en la clase
  ){
    this.title = 'Registrarse';
    this.user = new User("",
    "",
    "",
    "",
    "",
    "ROLE_USER",
    "");
  }

  ngOnInit(){
    console.log('Componente del register cargando..')
  }

  onSubmit(form){ // Método - Estan vinculados los campos con ngModule y se modifican las propuedades del objeto User
    // console.log(this.user);
   this._userService.register(this.user).subscribe(
    response => {
      if(response.user && response.user._id){
        // console.log(response.user);
        this.status = 'success';
        form.reset();
      }else{
        this.status = 'error';
      }
    },
    error => {
      console.log(<any>error);
    }
   );
  }
}
