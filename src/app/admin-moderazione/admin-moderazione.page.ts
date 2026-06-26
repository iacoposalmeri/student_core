import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-moderazione',
  templateUrl: './admin-moderazione.page.html',
  styleUrls: ['./admin-moderazione.page.scss'],
  standalone: false
})
export class AdminModerazionePage implements OnInit, OnDestroy {
  
  sezioneAttiva: 'materiale' | 'annunci' = 'materiale';
  filtroStato: string = 'attesa'; 

  listaMateriale: any[] = [];
  listaAnnunci: any[] = [];
  listaMaterialeGlobale: any[] = [];
  listaAnnunciGlobale: any[] = [];
  
  isLoading: boolean = true;

  isModalChatOpen = false;
  messaggiChat: any[] = [];
  idAnnuncioSelezionato: number | null = null;

  chatInterval: any;

  constructor(private http: HttpClient, private alertCtrl: AlertController, private toastCtrl: ToastController) { }

  ngOnInit() { this.caricaDati(); }
  ionViewWillEnter() { this.caricaDati(); }

  ngOnDestroy() {
    if (this.chatInterval) clearInterval(this.chatInterval);
  }

  caricaDati(event?: any) {
    this.isLoading = true;
    let completate = 0;

    const controllaFine = () => { completate++; if(completate === 4) { this.isLoading = false; if(event) event.target.complete(); } };

    this.http.get<any[]>('http://localhost:3000/api/admin/moderazione/materiale').subscribe({ next: d => { this.listaMateriale = d; controllaFine(); }, error: () => controllaFine() });
    this.http.get<any[]>('http://localhost:3000/api/admin/moderazione/annunci').subscribe({ next: d => { this.listaAnnunci = d; controllaFine(); }, error: () => controllaFine() });
    
    this.http.get<any[]>('http://localhost:3000/api/admin/materiale/globale').subscribe({ next: d => { this.listaMaterialeGlobale = d; controllaFine(); }, error: () => controllaFine() });
    this.http.get<any[]>('http://localhost:3000/api/admin/annunci/globale').subscribe({ next: d => { this.listaAnnunciGlobale = d; controllaFine(); }, error: () => controllaFine() });
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
            this.http.put(`http://localhost:3000/api/admin/moderazione/${tipo}/${id}`, { stato: azione }).subscribe({
              next: () => this.caricaDati(),
              error: () => this.mostraToast("Errore di connessione", "danger")
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
            this.http.delete(`http://localhost:3000/api/admin/globale/${tipo}/${id}`).subscribe({
              next: () => this.caricaDati(),
              error: () => console.error("Errore durante l'eliminazione globale")
            });
          }
        }
      ]
    });
    await alert.present();
  }

  apriChatModerazione(idAnnuncio: number) {
    this.idAnnuncioSelezionato = idAnnuncio;
    this.isModalChatOpen = true;
    this.caricaMessaggiChat();

    if (this.chatInterval) clearInterval(this.chatInterval);
    this.chatInterval = setInterval(() => {
      this.caricaMessaggiChat();
    }, 3000);
  }

  caricaMessaggiChat() {
    this.http.get<any[]>(`http://localhost:3000/api/annunci/${this.idAnnuncioSelezionato}/messaggi`).subscribe(d => this.messaggiChat = d);
  }

  chiudiChatModerazione() {
    this.isModalChatOpen = false;
    if (this.chatInterval) clearInterval(this.chatInterval);
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
            this.http.delete(`http://localhost:3000/api/admin/annunci/messaggi/${idMessaggio}`).subscribe({
              next: () => this.caricaMessaggiChat(),
              error: () => console.error("Impossibile eliminare")
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async mostraToast(messaggio: string, colore: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message: messaggio,
      duration: 2200,
      color: colore,
      position: 'bottom'
    });
    await toast.present();
  }
}