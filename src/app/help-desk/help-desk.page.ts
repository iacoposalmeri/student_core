import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-help-desk',
  templateUrl: './help-desk.page.html',
  styleUrls: ['./help-desk.page.scss'],
  standalone: false
})
export class HelpDeskPage implements OnInit {
  idStudente: string | null = null;
  tickets: any[] = [];
  isLoading: boolean = true;

  isModalOpen: boolean = false;
  nuovoOggetto: string = '';
  nuovaDescrizione: string = '';

  constructor(
    private http: HttpClient, 
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.idStudente = localStorage.getItem('id');
    this.caricaTickets();
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
    // controllo campi vuoti
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
        this.caricaTickets();  // ricarico la lista aggiornata col nuovo ticket
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

  getBadgeColor(stato: string) {
    switch(stato) {
      case 'Aperto': return 'danger';   
      case 'In Carico': return 'warning';
      case 'Risolto': return 'success';  
      default: return 'medium';
    }
  }
}