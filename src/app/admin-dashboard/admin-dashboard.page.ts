import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false
})
export class AdminDashboardPage implements OnInit {

  sezioneAttiva: string = 'comunicazioni'; 
  nomeAdmin: string = 'Amministratore';

  constructor(private router: Router, private menuCtrl: MenuController) { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false, 'menu-studente');
    this.menuCtrl.enable(true, 'menu-admin');
  }

  ngOnInit() {
    this.nomeAdmin = localStorage.getItem('nome') || 'Giuseppe';
  }

  getTitoloSezione() {
    switch(this.sezioneAttiva) {
      case 'comunicazioni': return 'Editor Avvisi e News';
      case 'campus': return 'Gestione Smart Campus';
      case 'didattica': return 'Catalogo Offerta Didattica';
      case 'moderazione': return 'Coda di Moderazione';
      case 'tickets': return 'Help Desk Segnalazioni';
      case 'analytics': return 'Statistiche e Analytics';
      default: return 'Pannello di Controllo';
    }
  }

  logout() {
    this.menuCtrl.enable(true, 'menu-studente');
    this.menuCtrl.enable(false, 'menu-admin');

    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
