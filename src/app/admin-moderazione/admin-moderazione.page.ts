import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-admin-moderazione',
  templateUrl: './admin-moderazione.page.html',
  styleUrls: ['./admin-moderazione.page.scss'],
  standalone: false
})
export class AdminModerazionePage implements OnInit {
  
  sezioneAttiva: string = 'materiale';
  listaMateriale: any[] = [];
  listaAnnunci: any[] = [];
  isLoading: boolean = true;

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.caricaDati();
  }

  ionViewWillEnter() {
    this.caricaDati();
  }

  caricaDati(event?: any) {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    let chiamateCompletate = 0;

    // Carica la coda dei file didattici
    this.http.get<any[]>('http://localhost:3000/api/admin/moderazione/materiale', { headers }).subscribe({
      next: (data) => {
        this.listaMateriale = data;
        chiamateCompletate++;
        this.controllaFineCaricamento(chiamateCompletate, event);
      },
      error: () => this.controllaFineCaricamento(++chiamateCompletate, event)
    });

    // Carica la coda degli annunci marketplace
    this.http.get<any[]>('http://localhost:3000/api/admin/moderazione/annunci', { headers }).subscribe({
      next: (data) => {
        this.listaAnnunci = data;
        chiamateCompletate++;
        this.controllaFineCaricamento(chiamateCompletate, event);
      },
      error: () => this.controllaFineCaricamento(++chiamateCompletate, event)
    });
  }

  controllaFineCaricamento(count: number, event: any) {
    if (count === 2) {
      this.isLoading = false;
      if (event) event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.caricaDati(event);
  }

  async gestisciMateriale(id: number, azione: string) {
    const isApprovato = azione === 'Approvato';
    const popup = await this.alertCtrl.create({
      header: isApprovato ? 'Approva File' : 'Rifiuta File',
      message: isApprovato ? 'Pubblicare questo file per tutti gli iscritti alla materia?' : 'Vuoi rifiutare ed eliminare questo file?',
      cssClass: 'custom-task-alert',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: isApprovato ? 'Approva' : 'Elimina', 
          role: isApprovato ? 'confirm' : 'destructive',
          handler: () => {
            const token = localStorage.getItem('token');
            this.http.put(`http://localhost:3000/api/admin/moderazione/materiale/${id}`, { stato: azione }, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
              next: () => {
                // Rimuove la card con effetto istantaneo
                this.listaMateriale = this.listaMateriale.filter(m => m.id !== id);
              },
              error: () => alert("Errore di connessione.")
            });
          }
        }
      ]
    });
    await popup.present();
  }

  async gestisciAnnuncio(id: number, azione: string) {
    const isApprovato = azione === 'Approvato';
    const popup = await this.alertCtrl.create({
      header: isApprovato ? 'Approva Annuncio' : 'Rifiuta Annuncio',
      message: isApprovato ? 'Vuoi inserire questo annuncio nel Marketplace pubblico?' : 'Vuoi scartare questo annuncio e rimuoverlo?',
      cssClass: 'custom-task-alert',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: isApprovato ? 'Approva' : 'Elimina', 
          role: isApprovato ? 'confirm' : 'destructive',
          handler: () => {
            const token = localStorage.getItem('token');
            this.http.put(`http://localhost:3000/api/admin/moderazione/annunci/${id}`, { stato: azione }, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
              next: () => {
                
                this.listaAnnunci = this.listaAnnunci.filter(a => a.id !== id);
              },
              error: () => alert("Errore di connessione.")
            });
          }
        }
      ]
    });
    await popup.present();
  }
}