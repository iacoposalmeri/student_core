import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-help-desk',
  templateUrl: './admin-help-desk.page.html',
  styleUrls: ['./admin-help-desk.page.scss'],
  standalone: false
})
export class AdminHelpDeskPage implements OnInit {

  sezioneAttiva: string = 'da_gestire';
  listaTickets: any[] = [];
  isLoading: boolean = true;
  isModalChatOpen: boolean = false;
  ticketAttivo: any = null;
  messaggiChat: any[] = [];
  nuovoMessaggio: string = '';

  constructor(private http: HttpClient, private alertCtrl: AlertController, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.caricaTickets();
  }

  ionViewWillEnter() {
    this.caricaTickets();
  }

  caricaTickets(event?: any) {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    
    this.http.get<any[]>('http://localhost:3000/api/admin/tickets').subscribe({
      next: (data) => {
        this.listaTickets = data;
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error("Errore fetch tickets:", err);
        this.isLoading = false;
        if (event) event.target.complete();
      }
    });
  }

  doRefresh(event: any) {
    this.caricaTickets(event);
  }

  getTicketsFiltrati() {
    if (this.sezioneAttiva === 'da_gestire') {
      return this.listaTickets.filter(t => t.stato === 'Aperto' || t.stato === 'In Carico');
    } else {
      return this.listaTickets.filter(t => t.stato === 'Risolto');
    }
  }

  cambiaStatoTicket(idTicket: number, nuovoStato: string) {
    const token = localStorage.getItem('token');
    
    this.http.put(`http://localhost:3000/api/admin/tickets/${idTicket}`, 
      { stato: nuovoStato }
    ).subscribe({
      next: (res: any) => {
        this.caricaTickets(); 
      },
      error: (err) => {
        this.mostraToast("Impossibile aggiornare lo stato", "danger");
      }
    });
  }

  apriChat(ticket: any) {
    this.ticketAttivo = ticket;
    this.isModalChatOpen = true;
    this.caricaMessaggi();
  }

  caricaMessaggi() {
    if (!this.ticketAttivo) return;
    this.http.get<any[]>(`http://localhost:3000/api/tickets/${this.ticketAttivo.id}/messaggi`).subscribe({
      next: (data) => this.messaggiChat = data,
      error: (err) => {
        console.error("Errore caricamento chat:", err)
      }
    });
  }

  inviaMessaggio() {
    if (!this.nuovoMessaggio.trim()) return;

    const payload = {
      testo: this.nuovoMessaggio.trim(),
      autore_ruolo: 'admin'
    };

    this.http.post(`http://localhost:3000/api/tickets/${this.ticketAttivo.id}/messaggi`, payload).subscribe({
      next: () => {
        this.nuovoMessaggio = '';
        this.caricaMessaggi(); 
      },
      error: (err) => {
        this.mostraToast("Errore di invio", "danger");
      }
    });
  }

  async eliminaTicket(idTicket: number) {
    const popUpConferma = await this.alertCtrl.create({
      header: 'Elimina Segnalazione',
      message: 'Sei sicuro di voler eliminare definitivamente questo ticket? L\'intera chat verrà persa.',
      cssClass: 'custom-task-alert', 
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Elimina', 
          role: 'destructive',
          handler: () => {
            const token = localStorage.getItem('token');
            this.http.delete(`http://localhost:3000/api/tickets/${idTicket}`).subscribe({
              next: () => {
                this.listaTickets = this.listaTickets.filter(t => t.id !== idTicket);
              },
              error: (err) => {
                console.error("Errore durante l'eliminazione", err);
              }
            });
          }
        }
      ]
    });
    await popUpConferma.present();
  }

  getBadgeColor(stato: string) {
    switch(stato) {
      case 'Aperto': return 'danger';   
      case 'In Carico': return 'warning';
      case 'Risolto': return 'success';  
      default: return 'medium';
    }
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