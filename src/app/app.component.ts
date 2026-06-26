import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  nomeStudente: string = 'Studente';
  cognomeStudente: String = "Studente";
  fotoProfilo: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  constructor(
    private router: Router,
    private menuCtrl: MenuController
  ) {
    this.inizializzaTema();
  }

  inizializzaTema() {
    const temaSalvato = localStorage.getItem('tema-colore');

    if (temaSalvato && temaSalvato !== 'default') {
      document.body.classList.add(`theme-${temaSalvato}`);
    }
  }

  caricaDatiMenu() {
    this.nomeStudente = localStorage.getItem('nome') || 'Studente';
    this.cognomeStudente = localStorage.getItem('cognome') || 'Studente';
    
    const fotoSalvata = localStorage.getItem('foto');
    
    if (fotoSalvata && fotoSalvata !== 'null' && fotoSalvata !== 'undefined' && fotoSalvata.trim() !== '') {
      this.fotoProfilo = fotoSalvata;
    } else {
      this.fotoProfilo = 'https://ionicframework.com/docs/img/demos/avatar.svg';
    }
  }

  navigaA(percorso: string) {
    this.menuCtrl.close();
    this.router.navigate([percorso]);
  }

  logout() {
    localStorage.clear();
    this.menuCtrl.close();

    document.body.classList.remove('theme-green', 'theme-pink', 'theme-red', 'theme-purple', 'theme-orange');

    this.router.navigate(['/login']);
  }
}