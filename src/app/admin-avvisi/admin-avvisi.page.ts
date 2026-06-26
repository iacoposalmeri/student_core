import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController, ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-admin-avvisi',
  templateUrl: './admin-avvisi.page.html',
  styleUrls: ['./admin-avvisi.page.scss'],
  standalone: false
})
export class AdminAvvisiPage implements ViewWillEnter {

  nuovaNews = {
    titolo: '',
    contenuto: '',
    id_corso_destinatario: null,
    id_materia_destinatario: null
  };

  listaNews: any[] = [];
  listaCorsi: any[] = [];
  listaMaterie: any[] = [];
  materieFiltrate: any[] = [];

  constructor(private http: HttpClient, private toastCtrl: ToastController, private alertCtrl: AlertController ) {}

  ionViewWillEnter() {
    this.caricaNews();
    this.caricaFiltri();
  }

  caricaFiltri() {
    this.http.get<any[]>('http://localhost:3000/api/corsi').subscribe(data => this.listaCorsi = data);
    this.http.get<any[]>('http://localhost:3000/api/admin/materie').subscribe(data => {
      this.listaMaterie = data;
      this.materieFiltrate = []; 
    });
  }

  onCorsoChange() {
    this.nuovaNews.id_materia_destinatario = null;
    
    if (this.nuovaNews.id_corso_destinatario === null) {
      this.materieFiltrate = []; 
    } else {
      this.materieFiltrate = this.listaMaterie.filter(
        m => m.id_corso === this.nuovaNews.id_corso_destinatario
      );
    }
  }

  caricaNews() {
    this.http.get(`http://localhost:3000/api/admin/news`).subscribe((data: any) => {
      this.listaNews = data;
    });
  }

  async eliminaAvviso(id: any) {
    if (!id) return;

    const alert = await this.alertCtrl.create({
      header: 'Elimina Avviso',
      message: 'Sei sicuro di voler eliminare definitivamente questa comunicazione istituzionale?',
      buttons: [
        { 
          text: 'Annulla', 
          role: 'cancel' 
        },
        { 
          text: 'Elimina', 
          role: 'destructive',
          handler: () => {
            this.http.delete(`http://localhost:3000/api/admin/news/${id}`).subscribe({
              next: () => {
                this.mostraToast("Avviso eliminato con successo", "success");
                this.caricaNews();
              },
              error: (err) => {
                console.error("Errore eliminazione:", err);
                this.mostraToast("Impossibile eliminare l'avviso", "danger");
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  diramaAvviso() {
    if (!this.nuovaNews.titolo || !this.nuovaNews.contenuto) return;

    this.http.post('http://localhost:3000/api/admin/news', this.nuovaNews).subscribe({
      next: (response: any) => {
        this.mostraToast(response.messaggio, "success");
        this.nuovaNews = { titolo: '', contenuto: '', id_corso_destinatario: null, id_materia_destinatario: null };
        this.caricaNews();
      },
      error: (err) => {
        this.mostraToast("Errore durante l'invio", "danger");
      }
    });
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