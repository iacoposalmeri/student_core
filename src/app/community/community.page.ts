import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
  standalone: false
})
export class CommunityPage {

  statoCommunity: string = 'campus';
  idStudente: string | null = null;
  
  annunci: any[] = [];

  modelloAnnuncio: any = {
    titolo: null,
    descrizione: null,
    prezzo: null,
    tipologia: null,
    data_pubblicazione: null,
    id_studente: null
  };

  servizi: any[] = [];
  aule: any[] = [];
  testoRicercaAula: string = '';

  isModalAperto: boolean = false;

  get auleFiltrate() {
    if (!this.testoRicercaAula) {
      return this.aule;
    }
    const testo = this.testoRicercaAula.toLowerCase();
    return this.aule.filter(a => 
      a.nome_aula.toLowerCase().includes(testo) || 
      a.edificio.toLowerCase().includes(testo)
    );
  }

  constructor(private http: HttpClient, private toastController: ToastController, private menuCtrl: MenuController) { }

  ionViewWillEnter() {
    this.idStudente = localStorage.getItem('id');
    this.getAnnunci();
    this.getAule();
    this.getServizi();
  }

  getAnnunci() {
    this.http.get<any[]>("http://localhost:3000/api/annunci").subscribe({
      next: (data) => {
        this.annunci = data;
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        console.error("Errore annunci:", err)
      }
    });
  }

  postAnnunci() {
    const prezzo = Number(this.modelloAnnuncio.prezzo);
    
    if (!prezzo || prezzo < 1 || prezzo > 200) {
      console.warn("Il prezzo deve essere compreso tra 1 e 9999 euro.");
      return; // Interrompe l'esecuzione se la condizione è verificata
    }

    this.modelloAnnuncio.id_studente = this.idStudente;
    const ora = new Date();
    const dataFormattata = ora.toLocaleDateString('it-IT') + ', ' + ora.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    this.modelloAnnuncio.data_pubblicazione = dataFormattata;

    this.http.post("http://localhost:3000/api/annunci", this.modelloAnnuncio).subscribe({
      next: () => {
        this.getAnnunci();
        this.modelloAnnuncio = {
          titolo: null,
          descrizione: null,
          prezzo: null,
          tipologia: null,
          data_pubblicazione: null,
          id_studente: null
        };
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        console.error("Errore caricamento annuncio:", err)
      }
    });
  }

  correggiPrezzo() {
    let prezzo = Number(this.modelloAnnuncio.prezzo);

    if (prezzo < 1) {
      this.modelloAnnuncio.prezzo = 1;
    } else if (prezzo > 200) {
      this.modelloAnnuncio.prezzo = 200;
    }
  }

  getServizi() {
    this.http.get<any[]>("http://localhost:3000/api/campus/servizi").subscribe({
      next: (data) => {
        this.servizi = data;
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        console.error("Errore servizi:", err)
      }  
    });
  }

  getAule() {
    this.http.get<any[]>("http://localhost:3000/api/campus/aule").subscribe({
      next: (data) => {
        this.aule = data;
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        console.error("Errore aule:", err)
      }
    });
  }

  async postAule(idAula: number, livello: string) { 
    
    const dataFormattata = new Date().toISOString();
    var pacchetto: any = {
      id_studente : this.idStudente,
      id_aula: idAula,
      data_ora : dataFormattata,
      livello_affollamento: livello, 
    };

    this.http.post("http://localhost:3000/api/campus/checkin", pacchetto).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: `Grazie! Segnalazione effettuata: Affollamento ${livello}`,
          duration: 2500,
          color: 'success',
          position: 'bottom',
          icon: 'checkmark-circle-outline'
        });
        await toast.present();

        this.getAule();
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        console.error("Errore caricamento aule:", err)
      }
    });
  }

  apriMenu() {
    this.menuCtrl.open();
  }

  doRefresh(event: any) {
    this.ionViewWillEnter(); // <-- GENIALE: Richiama la funzione che ricarica già tutti i dati!
    
    setTimeout(() => {
      event.target.complete(); // Dopo mezzo secondo, nasconde la rotellina
    }, 500); 
  }
}
