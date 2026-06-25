import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.caricaTickets();
  }

  ionViewWillEnter() {
    this.caricaTickets();
  }

  caricaTickets(event?: any) {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    
    this.http.get<any[]>('http://localhost:3000/api/admin/tickets', { 
      headers: { Authorization: `Bearer ${token}` } 
    }).subscribe({
      next: (data) => {
        this.listaTickets = data;
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
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
      { stato: nuovoStato },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (res: any) => {
        this.caricaTickets(); 
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        alert("Errore: " + (err.error?.errore || "Impossibile aggiornare lo stato"));
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
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
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
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        alert("Errore di invio")
      }
    });
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