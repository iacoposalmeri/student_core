import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, IonModal } from '@ionic/angular';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.page.html',
  styleUrls: ['./timer.page.scss'],
  standalone: false
})
export class TimerPage implements OnInit {

  @ViewChild('modalPicker') modalPicker!: IonModal;

  statoAttuale: 'studio' | 'pause_breve' | 'pausa_lunga' = 'studio';

  durataStudio: number = 25 * 60;
  durataPausaBreve: number = 5 * 60;
  durataPausaLunga: number = 15 * 60;

  tempoRimanente: number = this.durataStudio;
  timerInterval: any;
  inEsecuzione: boolean = false;
  pomodoriCompletati: number = 0;

  minutiArray: number[] = Array.from({ length: 61 }, (_, i) => i); 
  secondiArray: number[] = Array.from({ length: 60 }, (_, i) => i); 
  
  faseInModifica: 'studio' | 'pausaBreve' | 'pausaLunga' = 'studio';
  
  pickerMinuti: any = 0;
  pickerSecondi: any = 0;

  constructor(private menuCtrl: MenuController) { }

  ngOnInit() {
    const savedStudio = localStorage.getItem('timer_studio');
    const savedPausaBreve = localStorage.getItem('timer_pausa_breve');
    const savedPausaLunga = localStorage.getItem('timer_pausa_lunga');

    if (savedStudio) this.durataStudio = parseInt(savedStudio, 10);
    if (savedPausaBreve) this.durataPausaBreve = parseInt(savedPausaBreve, 10);
    if (savedPausaLunga) this.durataPausaLunga = parseInt(savedPausaLunga, 10);

    this.resetTimer();
  }

  apriMenu() {
    this.menuCtrl.open();
  }

  formattaTempo() {
    const minuti = Math.floor(this.tempoRimanente / 60);
    const secondi = this.tempoRimanente % 60;
    return (minuti < 10 ? "0" + minuti : minuti) + ":" + (secondi < 10 ? "0" + secondi : secondi);
  }

  formattaEtichetta(secondiTotali: number) {
    const m = Math.floor(secondiTotali / 60);
    const s = secondiTotali % 60;
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  }

  avviaTimer() {
    this.inEsecuzione = true;
    this.timerInterval = setInterval(() => {
      if (this.tempoRimanente > 0) {
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
      if (this.pomodoriCompletati % 4 !== 0) {
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

  apriModalPicker(fase: 'studio' | 'pausaBreve' | 'pausaLunga', totaleSecondi: number) {
    this.faseInModifica = fase;
    this.pickerMinuti = Math.floor(totaleSecondi / 60);
    this.pickerSecondi = totaleSecondi % 60;
    this.modalPicker.present();
  }

  salvaPicker() {
    const min = Number(this.pickerMinuti) || 0;
    const sec = Number(this.pickerSecondi) || 0;
    const totaleSecondi = (min * 60) + sec;
    
    if (this.faseInModifica === 'studio') {
      this.durataStudio = totaleSecondi;
      localStorage.setItem('timer_studio', totaleSecondi.toString());
    } 
    else if (this.faseInModifica === 'pausaBreve') {
      this.durataPausaBreve = totaleSecondi;
      localStorage.setItem('timer_pausa_breve', totaleSecondi.toString());
    } 
    else if (this.faseInModifica === 'pausaLunga') {
      this.durataPausaLunga = totaleSecondi;
      localStorage.setItem('timer_pausa_lunga', totaleSecondi.toString());
    }

    this.resetTimer();
    this.modalPicker.dismiss();
  }

  resetTuttoDefault() {
    this.pausaTimer();
    
    this.durataStudio = 25 * 60;
    this.durataPausaBreve = 5 * 60;
    this.durataPausaLunga = 15 * 60;

    localStorage.removeItem('timer_studio');
    localStorage.removeItem('timer_pausa_breve');
    localStorage.removeItem('timer_pausa_lunga');

    this.statoAttuale = 'studio';
    this.pomodoriCompletati = 0;

    this.tempoRimanente = this.durataStudio;
  }
}