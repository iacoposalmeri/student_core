import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-admin-didattica',
  templateUrl: './admin-didattica.page.html',
  styleUrls: ['./admin-didattica.page.scss'],
  standalone: false
})
export class AdminDidatticaPage implements OnInit {

  sezioneAttiva: string = 'materie';
  
  listaMaterie: any[] = [];
  listaLezioni: any[] = [];
  listaAule: any[] = [];
  listaCorsi: any[] = []; 

  giornoSelezionato: string = 'Lunedì';
  giorniSettimana = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];

  nuovaMateria = { nome_materia: '', cfu: 6, semestre: 1, anno: 1, docente: '', id_corso: null };
  nuovaLezione = { giorno_settimana: 'Lunedì', orario_inizio: '08:30', orario_fine: '10:30', id_materia: null, id_aula: null };

  isModalMateriaOpen = false;
  isModalLezioneOpen = false;

  isModalOrarioOpen = false;
  faseOrario: 'inizio' | 'fine' = 'inizio';
  pickerOra: any = 8;
  pickerMinuto: any = 30;
  
  oreArray: number[] = Array.from({ length: 12 }, (_, i) => i + 8); 
  minutiArray: number[] = Array.from({ length: 60 }, (_, i) => i);

  minutiVisualizzati: number[] = this.minutiArray;

  constructor(private http: HttpClient, private alertCtrl: AlertController, private toastCtrl: ToastController ) {}

  ngOnInit() { this.caricaTutto(); }
  ionViewWillEnter() { this.caricaTutto(); }

  caricaTutto(event?: any) {
    forkJoin({
      materie: this.http.get<any[]>('http://localhost:3000/api/admin/materie'),
      lezioni: this.http.get<any[]>('http://localhost:3000/api/admin/lezioni'),
      aule: this.http.get<any[]>('http://localhost:3000/api/campus/aule'),
      corsi: this.http.get<any[]>('http://localhost:3000/api/corsi') 
    }).subscribe({
      next: (res) => {
        this.listaMaterie = res.materie;
        this.listaLezioni = res.lezioni;
        this.listaAule = res.aule;
        this.listaCorsi = res.corsi;
        if (event) event.target.complete(); 
      },
      error: (err) => {
        console.error("Errore fetch didattica:", err);
        if (event) event.target.complete();
      }
    });
  }

  doRefresh(event: any) { this.caricaTutto(event); }

  docenteRegexValido(): boolean {
    const regexDocente =/^[A-Za-zÀ-ÿ]{2,}\s+[A-Za-zÀ-ÿ]{2,}$/;
    return regexDocente.test(this.nuovaMateria.docente?.trim() || '');
  }

  isMateriaValida(): boolean {
    return !!(this.nuovaMateria.nome_materia && 
              this.nuovaMateria.cfu >= 1 && 
              this.nuovaMateria.cfu <= 24 && 
              this.nuovaMateria.id_corso &&
              this.docenteRegexValido());
  }

  isLezioneValida(): boolean {
    const l = this.nuovaLezione;
    if (!l.id_materia || !l.id_aula || !l.orario_inizio || !l.orario_fine) return false;
    
    const [hIni, mIni] = l.orario_inizio.split(':').map(Number);
    const [hFin, mFin] = l.orario_fine.split(':').map(Number);
    const minutiInizio = (hIni * 60) + mIni;
    const minutiFine = (hFin * 60) + mFin;
    
    if (minutiFine - minutiInizio < 60) return false;
    return true;
  }

  apriModalOrario(fase: 'inizio' | 'fine') {
    this.faseOrario = fase;
    const timeStr = fase === 'inizio' ? this.nuovaLezione.orario_inizio : this.nuovaLezione.orario_fine;
    const parts = timeStr ? timeStr.split(':') : ['08', '30'];
    
    this.pickerOra = parseInt(parts[0], 10) || 8;
    this.pickerMinuto = parseInt(parts[1], 10) || 0;
    
    this.aggiornaMinutiDisponibili(this.pickerOra);
    this.isModalOrarioOpen = true;
  }

  aggiornaMinutiDisponibili(oraSelezionata: any) {
    this.pickerOra = Number(oraSelezionata);
    
    if (this.pickerOra === 19) {
      this.minutiVisualizzati = [0];
      this.pickerMinuto = 0;
    } else {
      this.minutiVisualizzati = this.minutiArray;
    }
  }

  salvaOrario() {
    const h = this.pickerOra < 10 ? '0' + this.pickerOra : this.pickerOra.toString();
    const m = this.pickerMinuto < 10 ? '0' + this.pickerMinuto : this.pickerMinuto.toString();
    
    if (this.faseOrario === 'inizio') {
      this.nuovaLezione.orario_inizio = `${h}:${m}`;
    } else {
      this.nuovaLezione.orario_fine = `${h}:${m}`;
    }
    this.isModalOrarioOpen = false;
  }

  salvaMateria() {
    this.http.post('http://localhost:3000/api/admin/materie', this.nuovaMateria).subscribe({
      next: (res: any) => {
        this.mostraToast(res.messaggio, "success");
        this.nuovaMateria = { nome_materia: '', cfu: 6, semestre: 1, anno: 1, docente: '', id_corso: null };
        this.isModalMateriaOpen = false;
        this.caricaTutto();
      },
      error: () => this.mostraToast("Impossibile salvare la materia", "danger")
    });
  }

  async eliminaMateria(id: any) {
    const alert = await this.alertCtrl.create({
      header: 'Elimina Materia',
      message: 'ATTENZIONE: Verranno distrutti orari di lezione ed esami per questa materia! Confermi?',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Elimina', role: 'destructive',
          handler: () => {
            this.http.delete(`http://localhost:3000/api/admin/materie/${id}`).subscribe({
              next: () => {
                this.mostraToast("Materia eliminata", "success");
                this.caricaTutto();
              },
              error: () => this.mostraToast("Errore durante l'eliminazione", "danger")
            });
          }
        }
      ]
    });
    await alert.present();
  }

  salvaLezione() {
    this.http.post('http://localhost:3000/api/admin/lezioni', this.nuovaLezione).subscribe({
      next: (res: any) => {
        this.mostraToast(res.messaggio, "success");
        this.nuovaLezione = { giorno_settimana: 'Lunedì', orario_inizio: '08:30', orario_fine: '10:30', id_materia: null, id_aula: null };
        this.isModalLezioneOpen = false;
        this.caricaTutto();
      },
      error: (err) => {
        this.alertCtrl.create({
          header: 'Conflitto Rilevato',
          message: err.error?.errore || "Impossibile assegnare lo slot",
          buttons: ['OK']
        }).then(a => a.present());
      }
    });
  }

  async eliminaLezione(id: any) {
    const alert = await this.alertCtrl.create({
      header: 'Rimuovi Lezione',
      message: 'Sicuro di voler rimuovere questo slot orario dal palinsesto?',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Rimuovi', role: 'destructive',
          handler: () => {
            this.http.delete(`http://localhost:3000/api/admin/lezioni/${id}`).subscribe({
              next: () => {
                this.mostraToast("Slot rimosso", "success");
                this.caricaTutto();
              },
              error: () => this.mostraToast("Errore di rimozione", "danger")
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getLezioniDelGiorno() {
    return this.listaLezioni.filter(l => l.giorno_settimana === this.giornoSelezionato);
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