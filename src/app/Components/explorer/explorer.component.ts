import { Component, OnInit } from '@angular/core';
import { GLOBAL } from '../../services/global'

@Component({
  selector: 'explorer',
  templateUrl: './explorer.component.html'
})

export class ExplorerComponent implements OnInit{
  public title:string;

  constructor(){
    this.title = '· Creative Focus ·'
  }

  ngOnInit(){
    console.log('explorer.component cargado!');
  }
}
