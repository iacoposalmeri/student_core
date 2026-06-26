import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, MenuController, AlertController } from '@ionic/angular';

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

  constructor(private http: HttpClient, private toastCtrl: ToastController, private menuCtrl: MenuController, private alertCtrl: AlertController) { }

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
        console.error("Errore annunci:", err)
      }
    });
  }

  postAnnunci() {
    const prezzo = Number(this.modelloAnnuncio.prezzo);
    if (!prezzo || prezzo < 1 || prezzo > 200) {
      console.warn("Il prezzo deve essere compreso tra 1 e 9999 euro.");
      return; 
    }

    this.modelloAnnuncio.id_studente = this.idStudente;
    const ora = new Date();
    const dataFormattata = ora.toLocaleDateString('it-IT') + ', ' + ora.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    this.modelloAnnuncio.data_pubblicazione = dataFormattata;

    this.http.post("http://localhost:3000/api/annunci", this.modelloAnnuncio).subscribe({
      next: () => {
        this.mostraToast("Annuncio inviato in approvazione!", "success");
        
        this.getAnnunci();
        this.modelloAnnuncio = { titolo: null, descrizione: null, prezzo: null, tipologia: null, data_pubblicazione: null, id_studente: null };
      },
      error: (err) => console.error("Errore caricamento annuncio:", err)
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
        const toast = await this.toastCtrl.create({
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
        console.error("Errore caricamento aule:", err)
      }
    });
  }

  async eliminaMioAnnuncio(idAnnuncio: number) {
    const popup = await this.alertCtrl.create({
      header: 'Ritira Annuncio',
      message: 'Vuoi eliminare definitivamente il tuo annuncio dal Marketplace?',
      cssClass: 'custom-task-alert',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Elimina', role: 'destructive',
          handler: () => {
            this.http.delete(`http://localhost:3000/api/annunci/studente/${idAnnuncio}`).subscribe({
              next: () => {
                this.annunci = this.annunci.filter(a => a.id !== idAnnuncio);
              },
              error: () => this.mostraToast("Errore durante l'eliminazione", "danger")
            });
          }
        }
      ]
    });
    await popup.present();
  }

  isModalChatAperto = false;
  annuncioAttivo: any = null;
  messaggiChat: any[] = [];
  nuovoMessaggioChat: string = '';

  apriChatAnnuncio(annuncio: any) {
    this.annuncioAttivo = annuncio;
    this.nuovoMessaggioChat = '';
    this.isModalChatAperto = true;
    this.caricaChatAnnuncio();
  }
  caricaChatAnnuncio() {
    this.http.get<any[]>(`http://localhost:3000/api/annunci/${this.annuncioAttivo.id}/messaggi`).subscribe(data => {
      this.messaggiChat = data;
    });
  }

  inviaMessaggioChat() {
    if (!this.nuovoMessaggioChat || this.nuovoMessaggioChat.trim() === '') return;
  
    const payload = { testo: this.nuovoMessaggioChat, id_mittente: this.idStudente };

    this.http.post(`http://localhost:3000/api/annunci/${this.annuncioAttivo.id}/messaggi`, payload).subscribe(() => {
      this.nuovoMessaggioChat = '';
      this.caricaChatAnnuncio();
    });
  }

  apriMenu() {
    this.menuCtrl.open();
  }

  doRefresh(event: any) {
    this.ionViewWillEnter();
    
    setTimeout(() => {
      event.target.complete();
    }, 500); 
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
