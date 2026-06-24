import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http'; // <-- 1. AGGIUNGI IMPORT

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false
})
export class AdminDashboardPage implements OnInit {

  sezioneAttiva: string = 'comunicazioni'; 
  nomeAdmin: string = 'Amministratore';

  // IL SECCHIO CHE RACCOGLIE IL TESTO DEL FORM:
  nuovaNews = {
    titolo: '',
    contenuto: '',
    tipo: 'Generale'
  };

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private http: HttpClient // <-- 2. INIETTALO QUI
  ) { }

  ngOnInit() {
    this.nomeAdmin = localStorage.getItem('nome') || 'Giuseppe';
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false, 'menu-studente');
    this.menuCtrl.enable(true, 'menu-admin');
  }

  // ========================================================================
  // LA FUNZIONE CHE SPARA L'AVVISO AL SERVER:
  // ========================================================================
  diramaAvviso() {
    if (!this.nuovaNews.titolo || !this.nuovaNews.contenuto) return;

    this.http.post('http://localhost:3000/api/news', this.nuovaNews).subscribe({
      next: (response: any) => {
        alert("🎉 " + response.messaggio);
        // Svuota il form dopo l'invio:
        this.nuovaNews = { titolo: '', contenuto: '', tipo: 'Generale' };
      },
      error: (err) => {
        alert("Errore del server: " + (err.error?.errore || err.error?.error || "Impossibile inviare"));
      }
    });
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