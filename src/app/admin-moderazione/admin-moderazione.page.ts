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
  
  sezioneAttiva: 'materiale' | 'annunci' = 'materiale';
  filtroStato: string = 'attesa'; 

  listaMateriale: any[] = [];
  listaAnnunci: any[] = [];
  listaMaterialeGlobale: any[] = [];
  listaAnnunciGlobale: any[] = [];
  
  isLoading: boolean = true;

  // Variabili Chat
  isModalChatOpen = false;
  messaggiChat: any[] = [];
  idAnnuncioSelezionato: number | null = null;

  constructor(private http: HttpClient, private alertCtrl: AlertController) { }

  ngOnInit() { this.caricaDati(); }
  ionViewWillEnter() { this.caricaDati(); }

  caricaDati(event?: any) {
    this.isLoading = true;
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    let completate = 0;

    const controllaFine = () => { completate++; if(completate === 4) { this.isLoading = false; if(event) event.target.complete(); } };

    this.http.get<any[]>('http://localhost:3000/api/admin/moderazione/materiale', { headers }).subscribe({ next: d => { this.listaMateriale = d; controllaFine(); }, error: () => controllaFine() });
    this.http.get<any[]>('http://localhost:3000/api/admin/moderazione/annunci', { headers }).subscribe({ next: d => { this.listaAnnunci = d; controllaFine(); }, error: () => controllaFine() });
    
    // QUESTE SONO LE LISTE GLOBALI CHE MANCAVANO!
    this.http.get<any[]>('http://localhost:3000/api/admin/materiale/globale', { headers }).subscribe({ next: d => { this.listaMaterialeGlobale = d; controllaFine(); }, error: () => controllaFine() });
    this.http.get<any[]>('http://localhost:3000/api/admin/annunci/globale', { headers }).subscribe({ next: d => { this.listaAnnunciGlobale = d; controllaFine(); }, error: () => controllaFine() });
  }

  doRefresh(event: any) { this.caricaDati(event); }

  async gestisci(id: number, azione: string, tipo: 'materiale' | 'annunci') {
    const popup = await this.alertCtrl.create({
      header: azione === 'Approvato' ? 'Approva' : 'Rifiuta/Elimina',
      message: 'Confermi questa operazione?',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Conferma', 
          handler: () => {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            this.http.put(`http://localhost:3000/api/admin/moderazione/${tipo}/${id}`, { stato: azione }, { headers }).subscribe({
              next: () => this.caricaDati(),
              error: () => alert("Errore di connessione.")
            });
          }
        }
      ]
    });
    await popup.present();
  }

  async eliminaPubblicato(id: number, tipo: 'materiale' | 'annunci') {
    const alert = await this.alertCtrl.create({
      header: 'Elimina Definitivamente',
      message: 'Vuoi rimuovere definitivamente questo elemento dal sistema?',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Elimina', 
          role: 'destructive',
          handler: () => {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            this.http.delete(`http://localhost:3000/api/admin/globale/${tipo}/${id}`, { headers }).subscribe({
              next: () => this.caricaDati(),
              error: () => console.error("Errore durante l'eliminazione globale")
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // --- GESTIONE CHAT ADMIN (Questo mancava nel tuo file!) ---
  apriChatModerazione(idAnnuncio: number) {
    this.idAnnuncioSelezionato = idAnnuncio;
    this.isModalChatOpen = true;
    this.caricaMessaggiChat();
  }

  caricaMessaggiChat() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    this.http.get<any[]>(`http://localhost:3000/api/annunci/${this.idAnnuncioSelezionato}/messaggi`, { headers }).subscribe(d => this.messaggiChat = d);
  }

  async eliminaMessaggio(idMessaggio: number) {
    const alert = await this.alertCtrl.create({
      header: 'Attenzione',
      message: 'Vuoi eliminare questo messaggio inappropriato dalla chat?',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Elimina', 
          role: 'destructive',
          handler: () => {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            this.http.delete(`http://localhost:3000/api/admin/annunci/messaggi/${idMessaggio}`, { headers }).subscribe({
              next: () => this.caricaMessaggiChat(),
              error: () => console.error("Impossibile eliminare")
            });
          }
        }
      ]
    });
    await alert.present();
  }
}