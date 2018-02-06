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
          // this.status = 'success';

          // PERSISTIR DATOS DEL USUARIO - Usamos el LocalStorage
          localStorage.setItem('identity',JSON.stringify(this.identity));

          // CONSEGUIR TOKEN
          this.getToken();

        }
      },
      error => {
        var errorMessage = <any>error;
        // console.log(errorMessage);

        if(errorMessage != null){
          this.status = 'error';
        }
      }
    );
  }

  getToken(){
    this._userService.signup(this.user, 'true').subscribe(
      response => {
        this.token = response.token;

        if(this.token.length <= 0){
          this.status = 'error';
        }else{
          // this.status = 'success';
          // PERSISTIR TOKEN DEL USUARIO
          localStorage.setItem('token', this.token);

          // CONSEGUIR LOS CONTADORES O ESTADISTICAS DEL USUARIO
          this.getCounters();

        }
      },
      error => {
        var errorMessage = <any>error;
        // console.log(errorMessage);

        if(errorMessage != null){
          this.status = 'error';
        }
      }
    );
  }

  getCounters(){
    this._userService.getCounters().subscribe(
      response => {
        //console.log(response);
        localStorage.setItem('stats', JSON.stringify(response));
        this.status = 'success';
        this._router.navigate(['/']); // redireccion al home tras login
        //if(response.following.length <= 0)
      },
      error => {
        console.log(<any>error);
      }
    )
  }
}
