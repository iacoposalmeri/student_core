import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-campus',
  templateUrl: './admin-campus.page.html',
  styleUrls: ['./admin-campus.page.scss'],
  standalone: false
})
export class AdminCampusPage implements OnInit {

  // Modelli controllati per l'interfaccia
  mensa = { id: 1, stato: 'Attivo', primo: '', secondo: '', contorno: '' };
  navetta = { id: 2, stato: 'Attivo', frequenza: 15, traffico: 'Traffico regolare' };
  biblioteca = { id: 3, stato: 'Attivo', apertura: '08:30', chiusura: '18:30' };

  // ==== VARIABILI PICKER ORARIO BIBLIOTECA ====
  isModalOrarioOpen = false;
  faseOrario: 'apertura' | 'chiusura' = 'apertura';
  pickerOra: any = 8;
  pickerMinuto: any = 30;
  
  // Limita le ore ESATTAMENTE tra 8 e 20
  oreArray: number[] = Array.from({ length: 13 }, (_, i) => i + 8); 
  minutiArray: number[] = Array.from({ length: 60 }, (_, i) => i);
  minutiVisualizzati: number[] = this.minutiArray;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.caricaServizi(); }
  ionViewWillEnter() { this.caricaServizi(); }

  caricaServizi(event?: any) {
    this.http.get<any[]>('http://localhost:3000/api/campus/servizi').subscribe({
      next: (res) => {
        // SMONTAGGIO DELLE STRINGHE DAL DB AI FORM CONTROLLATI
        res.forEach(s => {
          if (s.id === 1) {
            this.mensa.stato = s.stato_corrente;
            const parts = s.descrizione.split(' | ');
            if (parts.length === 3) {
              this.mensa.primo = parts[0].replace('Primo: ', '');
              this.mensa.secondo = parts[1].replace('Secondo: ', '');
              this.mensa.contorno = parts[2].replace('Contorno: ', '');
            }
          }
          else if (s.id === 2) {
            this.navetta.stato = s.stato_corrente;
            // Estrapola il numero dalla stringa
            const freqMatch = s.descrizione.match(/(\d+)\s*minuti/);
            if (freqMatch) this.navetta.frequenza = parseInt(freqMatch[1], 10);
            if (s.descrizione.includes('Traffico intenso')) this.navetta.traffico = 'Traffico intenso e ritardi';
            else if (s.descrizione.includes('guasto')) this.navetta.traffico = 'Corse soppresse per guasto';
            else this.navetta.traffico = 'Traffico regolare';
          }
          else if (s.id === 3) {
            this.biblioteca.stato = s.stato_corrente;
            const oreMatch = s.descrizione.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
            if (oreMatch) {
              this.biblioteca.apertura = oreMatch[1];
              this.biblioteca.chiusura = oreMatch[2];
            }
          }
        });
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error("Errore fetch campus:", err);
        if (event) event.target.complete();
      }
    });
  }

  doRefresh(event: any) { this.caricaServizi(event); }

  // --- LOGICA PICKER BIBLIOTECA ---
  isBibliotecaValida(): boolean {
    const [hIni, mIni] = this.biblioteca.apertura.split(':').map(Number);
    const [hFin, mFin] = this.biblioteca.chiusura.split(':').map(Number);
    const minIni = (hIni * 60) + mIni;
    const minFin = (hFin * 60) + mFin;
    // Chiusura deve essere almeno 1 ora dopo l'apertura
    return (minFin - minIni) >= 60;
  }

  apriModalOrario(fase: 'apertura' | 'chiusura') {
    this.faseOrario = fase;
    const timeStr = fase === 'apertura' ? this.biblioteca.apertura : this.biblioteca.chiusura;
    const parts = timeStr.split(':');
    
    this.pickerOra = parseInt(parts[0], 10) || 8;
    this.pickerMinuto = parseInt(parts[1], 10) || 0;
    
    this.aggiornaMinutiDisponibili(this.pickerOra);
    this.isModalOrarioOpen = true;
  }

  aggiornaMinutiDisponibili(oraSelezionata: any) {
    this.pickerOra = Number(oraSelezionata);
    if (this.pickerOra === 20) {
      this.minutiVisualizzati = [0]; 
      this.pickerMinuto = 0;         
    } else {
      this.minutiVisualizzati = this.minutiArray; 
    }
  }

  salvaOrario() {
    const h = this.pickerOra < 10 ? '0' + this.pickerOra : this.pickerOra.toString();
    const m = this.pickerMinuto < 10 ? '0' + this.pickerMinuto : this.pickerMinuto.toString();
    
    if (this.faseOrario === 'apertura') this.biblioteca.apertura = `${h}:${m}`;
    else this.biblioteca.chiusura = `${h}:${m}`;
    
    this.isModalOrarioOpen = false;
  }

  // --- SALVATAGGIO DEI SERVIZI ---
  salvaMensa() {
    // RIMONTAGGIO DELLA STRINGA
    const descrizioneComposta = `Primo: ${this.mensa.primo} | Secondo: ${this.mensa.secondo} | Contorno: ${this.mensa.contorno}`;
    this.inviaAggiornamento(this.mensa.id, descrizioneComposta, this.mensa.stato);
  }

  salvaNavetta() {
    const descrizioneComposta = `Passaggi ogni ${this.navetta.frequenza} minuti. ${this.navetta.traffico}.`;
    this.inviaAggiornamento(this.navetta.id, descrizioneComposta, this.navetta.stato);
  }

  salvaBiblioteca() {
    const descrizioneComposta = `Orario di apertura: ${this.biblioteca.apertura} - ${this.biblioteca.chiusura}.`;
    this.inviaAggiornamento(this.biblioteca.id, descrizioneComposta, this.biblioteca.stato);
  }

  inviaAggiornamento(id: number, descrizione: string, stato: string) {
    const token = localStorage.getItem('token');
    const body = { descrizione, stato_corrente: stato };
    
    this.http.put(`http://localhost:3000/api/campus/servizi/${id}`, body, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
      // Corretto res.message invece di res.messaggio
      next: (res: any) => alert(res.message), 
      error: (err) => {
        alert("Errore: " + (err.error?.error || "Impossibile aggiornare il servizio."))
      }
    });
  }
}