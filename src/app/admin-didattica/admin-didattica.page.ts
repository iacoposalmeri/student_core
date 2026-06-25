import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

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

  // ==== VARIABILI PICKER ORARIO (Stile Timer) ====
  isModalOrarioOpen = false;
  faseOrario: 'inizio' | 'fine' = 'inizio';
  pickerOra: any = 8;
  pickerMinuto: any = 30;
  
  // Limita le ore ESATTAMENTE tra 8 e 19
  oreArray: number[] = Array.from({ length: 12 }, (_, i) => i + 8); 
  minutiArray: number[] = Array.from({ length: 60 }, (_, i) => i);

  minutiVisualizzati: number[] = this.minutiArray;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.caricaTutto(); }
  ionViewWillEnter() { this.caricaTutto(); }

  caricaTutto(event?: any) {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    forkJoin({
      materie: this.http.get<any[]>('http://localhost:3000/api/admin/materie', { headers }),
      lezioni: this.http.get<any[]>('http://localhost:3000/api/admin/lezioni', { headers }),
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

  // --- LOGICA DI VALIDAZIONE REGEX ---
  docenteRegexValido(): boolean {
    // Obbliga ad inserire almeno due blocchi di lettere separati da spazio
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

  // --- FUNZIONI PICKER ORARIO ---
  apriModalOrario(fase: 'inizio' | 'fine') {
    this.faseOrario = fase;
    const timeStr = fase === 'inizio' ? this.nuovaLezione.orario_inizio : this.nuovaLezione.orario_fine;
    const parts = timeStr ? timeStr.split(':') : ['08', '30'];
    
    this.pickerOra = parseInt(parts[0], 10) || 8;
    this.pickerMinuto = parseInt(parts[1], 10) || 0;
    
    this.aggiornaMinutiDisponibili(this.pickerOra); // Calcola subito se nascondere i minuti!
    this.isModalOrarioOpen = true;
  }

  // LA MAGIA: Selezionando 19, i minuti spariscono
  aggiornaMinutiDisponibili(oraSelezionata: any) {
    this.pickerOra = Number(oraSelezionata);
    
    if (this.pickerOra === 19) {
      this.minutiVisualizzati = [0]; // Esiste solo lo '00'
      this.pickerMinuto = 0;         // Forza il selettore sullo 0
    } else {
      this.minutiVisualizzati = this.minutiArray; // Ripristina da 0 a 59
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

  // --- CHIAMATE AL DATABASE ---
  salvaMateria() {
    const token = localStorage.getItem('token');
    this.http.post('http://localhost:3000/api/admin/materie', this.nuovaMateria, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
      next: (res: any) => {
        alert(res.messaggio);
        this.nuovaMateria = { nome_materia: '', cfu: 6, semestre: 1, anno: 1, docente: '', id_corso: null };
        this.isModalMateriaOpen = false;
        this.caricaTutto();
      },
      error: (err) => {
        alert("Errore: " + (err.error?.errore || "Impossibile salvare"))
      }
    });
  }

  eliminaMateria(id: any) {
    if (!confirm("️ATTENZIONE: Verranno distrutti orari di lezione ed esami per questa materia! Confermi?")) return;
    const token = localStorage.getItem('token');
    this.http.delete(`http://localhost:3000/api/admin/materie/${id}`, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
      next: () => this.caricaTutto(),
      error: (err) => {
        alert("Errore: " + err.error?.errore)
      }
    });
  }

  salvaLezione() {
    const token = localStorage.getItem('token');
    this.http.post('http://localhost:3000/api/admin/lezioni', this.nuovaLezione, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
      next: (res: any) => {
        alert(res.messaggio);
        
        // RESET DEL FORM: Ripuliamo l'oggetto riportandolo allo stato iniziale
        this.nuovaLezione = { giorno_settimana: 'Lunedì', orario_inizio: '08:30', orario_fine: '10:30', id_materia: null, id_aula: null };
        
        this.isModalLezioneOpen = false;
        this.caricaTutto();
      },
      error: (err) => {
        alert("ATTENZIONE\n\n" + (err.error?.errore || "Impossibile assegnare slot"));
      }
    });
  }

  eliminaLezione(id: any) {
    if (!confirm("Sicuro di voler rimuovere questo slot orario dal palinsesto?")) return;
    
    const token = localStorage.getItem('token');
    this.http.delete(`http://localhost:3000/api/admin/lezioni/${id}`, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
      next: () => this.caricaTutto(),
      error: (err) => {
        alert("Errore: " + err.error?.errore)
      }
    });
  }

  getLezioniDelGiorno() {
    return this.listaLezioni.filter(l => l.giorno_settimana === this.giornoSelezionato);
  }
}