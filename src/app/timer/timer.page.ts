import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.page.html',
  styleUrls: ['./timer.page.scss'],
  standalone: false
})
export class TimerPage implements OnInit {

  statoAttuale: 'studio' | 'pause_breve' | 'pausa_lunga' = 'studio';

  durataStudio: number = 25 * 60;
  durataPausaBreve: number = 5 * 60;
  durataPausaLunga: number = 15 * 60;

  tempoRimanente: number = this.durataStudio;
  timerInterval: any;
  inEsecuzione: boolean = false;
  pomodoriCompletati: number = 0;

  constructor(private alertController: AlertController  ) { }

  ngOnInit() {
  }

  formattaTempo() {
    const tempo = this.tempoRimanente;
    const minuti = Math.floor(tempo / 60)
    const secondi = tempo % 60
    const stringa = (minuti < 10 ? "0" + minuti : minuti) + ":" + (secondi<10  ? "0" + secondi : secondi)
    return stringa
  }

  avviaTimer() {
    this.inEsecuzione = true;
    this.timerInterval = setInterval(() => {
      if (this.tempoRimanente>0) {
        this.tempoRimanente--;
      } else {
        this.suonaAllarme();
        this.cambiaFase();
      }
    }, 1000);
  }

  pausaTimer() {
    clearInterval(this.timerInterval);
    this.inEsecuzione = false;
  }

  resetTimer() {
    this.pausaTimer();
    if (this.statoAttuale === 'studio') this.tempoRimanente = this.durataStudio;
    else if (this.statoAttuale === 'pause_breve') this.tempoRimanente = this.durataPausaBreve;
    else this.tempoRimanente = this.durataPausaLunga;
  }

  cambiaFase() {
    if (this.statoAttuale === 'studio') {
      this.pomodoriCompletati++;
      if (this.pomodoriCompletati % 4) {
        this.statoAttuale = 'pause_breve';
        this.tempoRimanente = this.durataPausaBreve; 
      } else {
        this.statoAttuale = 'pausa_lunga';
        this.tempoRimanente = this.durataPausaLunga;
      }
    } else {
      this.statoAttuale = 'studio';
      this.tempoRimanente = this.durataStudio;
    }

    this.pausaTimer();
  }
  
  suonaAllarme() {
    const audio = new Audio('assets/sounds/timer_bell.wav');
    audio.play();
  }

  async mostraImpostazioni() {
    const alert = await this.alertController.create({
      header: 'Impostazioni Timer',
      message: 'Imposta la durata (in minuti):',
      inputs: [
        { name: 'studio', type: 'number', placeholder: 'Studio (es. 25)', value: this.durataStudio / 60 },
        { name: 'pausaBreve', type: 'number', placeholder: 'Pausa Breve (es. 5)', value: this.durataPausaBreve / 60 },
        { name: 'pausaLunga', type: 'number', placeholder: 'Pausa Lunga (es. 15)', value: this.durataPausaLunga / 60 }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Salva',
          handler: (dati) => {
            
            this.durataStudio = dati.studio * 60;
            this.durataPausaBreve = dati.pausaBreve * 60;
            this.durataPausaLunga = dati.pausaLunga * 60;
            
            this.resetTimer();
          }
        }
      ]
    });
    await alert.present();
  }

}
