import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController, ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-help-desk',
  templateUrl: './help-desk.page.html',
  styleUrls: ['./help-desk.page.scss'],
  standalone: false
})
export class HelpDeskPage implements OnInit, ViewWillEnter, OnDestroy {
  idStudente: string | null = null;
  tickets: any[] = [];
  isLoading: boolean = true;

  isModalOpen: boolean = false;
  nuovoOggetto: string = '';
  nuovaDescrizione: string = '';
  isModalChatOpen: boolean = false;
  ticketAttivo: any = null;
  messaggiChat: any[] = [];
  nuovoMessaggio: string = '';

  chatInterval: any;

  constructor(
    private http: HttpClient, 
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.idStudente = localStorage.getItem('id');
  }

  ionViewWillEnter() {
    if (this.idStudente) {
      this.caricaTickets();
    }
  }

  caricaTickets() {
    if (!this.idStudente) return;

    
    this.http.get<any[]>(`http://localhost:3000/api/tickets/studente/${this.idStudente}`).subscribe({
      next: (data) => {
        this.tickets = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore caricamento ticket:', err);
        this.isLoading = false;
      }
    });
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  inviaTicket() {
    if (!this.nuovoOggetto.trim() || !this.nuovaDescrizione.trim()) {
       this.mostraToast('Compila tutti i campi prima di inviare.', 'warning');
       return;
    }

    const payload = {
      oggetto: this.nuovoOggetto,
      descrizione: this.nuovaDescrizione,
      id_studente: this.idStudente
    };

    this.http.post('http://localhost:3000/api/tickets', payload).subscribe({
      next: (res: any) => {
        this.mostraToast('Ticket inviato con successo!', 'success');
        this.setOpen(false);
        this.nuovoOggetto = '';
        this.nuovaDescrizione = '';
        this.isLoading = true; 
        this.caricaTickets();
      },
      error: (err) => {
         this.mostraToast('Errore di connessione. Riprova.', 'danger');
      }
    });
  }

  async mostraToast(messaggio: string, colore: string) {
    const toast = await this.toastCtrl.create({
      message: messaggio,
      duration: 2500,
      color: colore,
      position: 'bottom'
    });
    await toast.present();
  }

  ngOnDestroy() {
    if (this.chatInterval) clearInterval(this.chatInterval);
  }

  apriChat(ticket: any) {
    this.ticketAttivo = ticket;
    this.isModalChatOpen = true;
    this.caricaMessaggi();
    
    this.chatInterval = setInterval(() => {
      this.caricaMessaggi();
    }, 3000);
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

  chiudiChat() {
    this.isModalChatOpen = false;
    if (this.chatInterval) clearInterval(this.chatInterval);
  }

  inviaMessaggio() {
    if (!this.nuovoMessaggio.trim()) return;

    const payload = {
      testo: this.nuovoMessaggio.trim(),
      autore_ruolo: 'studente' 
    };

    this.http.post(`http://localhost:3000/api/tickets/${this.ticketAttivo.id}/messaggi`, payload).subscribe({
      next: () => {
        this.nuovoMessaggio = '';
        this.caricaMessaggi(); 
      },
      error: (err) => {
        this.mostraToast("Errore di invio", "danger")
      }
    });
  }

  async eliminaTicket(idTicket: number) {
    const popUpConferma = await this.alertCtrl.create({
      header: 'Ritira Ticket',
      message: 'Sei sicuro di voler ritirare ed eliminare questa segnalazione?',
      cssClass: 'custom-task-alert', 
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Elimina', 
          role: 'destructive',
          handler: () => {
            this.http.delete(`http://localhost:3000/api/tickets/${idTicket}`).subscribe({
              next: () => {
                this.mostraToast("Ticket eliminato", "success");
                this.tickets = this.tickets.filter(t => t.id !== idTicket);
              },
              error: (err) => {
                this.mostraToast("Errore durante l'eliminazione", "danger");
              }
            });
          }
        }
      ]
    });
    await popUpConferma.present();
  }

  doRefresh(event: any) {
    this.ionViewWillEnter();
    
    setTimeout(() => {
      event.target.complete(); 
    }, 500); 
  }

  getBadgeColor(stato: string) {
    switch(stato) {
      case 'Aperto': return 'danger';   
      case 'In Carico': return 'warning';
      case 'Risolto': return 'success';  
      default: return 'medium';
    }
  }
}