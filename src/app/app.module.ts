import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { routing, appRoutingProviders } from './app.routing';

// Componentes
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';


@NgModule({
  declarations: [ // Puedo meter Componentes, Directivas y Pipes para declararlas de manera global
    AppComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    routing, // Modulo con configuracion de rutas
    FormsModule
  ],
  providers: [ // Servicios
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
