import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-personalizzazione',
  templateUrl: './personalizzazione.page.html',
  styleUrls: ['./personalizzazione.page.scss'],
  standalone: false
})
export class PersonalizzazionePage implements OnInit {

  temaAttuale: string = 'default';

  constructor() { }

  ngOnInit() {
    this.temaAttuale = localStorage.getItem('tema-colore') || 'default';
  }

  cambiaTema(colore: string) {
    this.temaAttuale = colore;
    
    document.body.classList.remove('theme-green', 'theme-pink', 'theme-red', 'theme-purple', 'theme-orange');
    
    if (colore !== 'default') {
      document.body.classList.add(`theme-${colore}`);
    }

    localStorage.setItem('tema-colore', colore);
  }
}