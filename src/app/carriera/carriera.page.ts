import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MenuController } from '@ionic/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-carriera',
  templateUrl: './carriera.page.html',
  styleUrls: ['./carriera.page.scss'],
  standalone: false
})
export class CarrieraPage implements OnInit {

  sezioneAttiva: string = 'esami'; 
  
  esamiSuperati: any[] = [];
  totaleCfu : number = 0;
  mediaVoti: number = 0;
  votoLaurea: number = 0;
  isLoadingEsami: boolean = true;
  isModalOpen = false;
  
  nuovoEsame: any = {
    id_materia: null,
    voto: null,
    lode: false,
    data_superamento: null,
    stato: 'Superato'
  };

  materieIscritte: any[] = [];
  materieDisponibili: any[] = [];
  isModalMaterieOpen = false;
  materiaSelezionata: any = null;

  idStudente : string | null = null;
  minData: string = '2000-09-01';
  maxData: string = '';

  isModalTortaOpen = false;
  graficoTorta: any;

  isModalAndamentoOpen = false;
  graficoAndamento: any;

  isModalMaterialeOpen = false;
  materialeMateria: any[] = [];
  isLoadingMateriale = false;
  nomeMateriaSelezionata = '';

  isModalNuovoMaterialeOpen = false;
  idMateriaSelezionata: number | null = null;
  
  nuovoMateriale = {
    titolo: '',
    tipo_file: 'pdf',
    url_file: ''
  };

  constructor(private http: HttpClient, private menuCtrl: MenuController) { }

  ngOnInit() {
    this.idStudente = localStorage.getItem('id');

    const oggi = new Date();
    this.maxData = oggi.toISOString().split('T')[0];

    const annoImm = localStorage.getItem('anno_immatricolazione');
    if (annoImm) {
      this.minData = `${annoImm}-09-01`; 
    } else {
      this.minData = '2015-09-01';
    }

    Chart.defaults.font.family = "'Montserrat', sans-serif";
    this.caricaDati();
  }

  caricaDati() {
    this.isLoadingEsami = true;

    this.http.get<any[]>("http://localhost:3000/api/esami/" + this.idStudente).subscribe({
      next: (data) => {
        this.esamiSuperati = data;
        this.calcolaStatistiche();
        this.isLoadingEsami = false;
      },
      error: (err) => console.error("Errore esami:", err)
    });

    this.http.get<any[]>("http://localhost:3000/api/materie/iscritte/" + this.idStudente).subscribe({
      next: (data) => this.materieIscritte = data,
      error: (err) => console.error("Errore materie iscritte:", err)
    });

    this.http.get<any[]>("http://localhost:3000/api/materie/disponibili/" + this.idStudente).subscribe({
      next: (data) => this.materieDisponibili = data,
      error: (err) => console.error("Errore materie disponibili:", err)
    });
  }

  salvaEsame() {
    const datiDaInviare = {
      id_studente: this.idStudente,
      id_materia: this.nuovoEsame.id_materia,
      voto: this.nuovoEsame.voto,
      lode: this.nuovoEsame.lode ? 1 : 0, 
      data_superamento: this.nuovoEsame.data_superamento,
      stato: 'Superato'
    };

    this.http.post("http://localhost:3000/api/esami", datiDaInviare).subscribe({
      next: () => {
        this.setOpen(false);
        this.nuovoEsame = { id_materia: null, voto: null, lode: false, data_superamento: null, stato: 'Superato' };
        this.caricaDati();
      },
      error: (err) => console.error("Errore salvataggio esame:", err)
    });
  }

  iscrivitiMateria() {
    const dati = {
      id_studente: this.idStudente,
      id_materia: this.materiaSelezionata
    };

    this.http.post("http://localhost:3000/api/materie/iscrizione", dati).subscribe({
      next: () => {
        this.setModalMaterieOpen(false);
        this.materiaSelezionata = null;
        this.caricaDati();
      },
      error: (err) => console.error("Errore iscrizione materia:", err)
    });
  }

  eliminaEsame(idEsame: number) {
    this.http.delete(`http://localhost:3000/api/esami/${idEsame}`).subscribe({
      next: () => {
        this.caricaDati(); 
      },
      error: (err) => console.error("Errore eliminazione esame:", err)
    });
  }

  eliminaMateria(idMateria: number) {
    this.http.delete(`http://localhost:3000/api/materie/iscrizione/${this.idStudente}/${idMateria}`).subscribe({
      next: () => {
        this.caricaDati(); 
      },
      error: (err) => console.error("Errore rimozione iscrizione:", err)
    });
  }


  calcolaStatistiche() {
    this.totaleCfu = 0;
    this.mediaVoti = 0;
    var sommaPonderata = 0;

    this.esamiSuperati.forEach(esame => {
      this.totaleCfu += esame.cfu;
      sommaPonderata += (esame.voto * esame.cfu);
    });

    if (this.totaleCfu > 0) {
      this.mediaVoti = sommaPonderata / this.totaleCfu;
      this.votoLaurea = this.mediaVoti / 30 * 110;
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  setModalMaterieOpen(isOpen: boolean) {
    this.isModalMaterieOpen = isOpen;
  }

  azioneBottonePiu() {
    if (this.sezioneAttiva === 'esami') {
      this.setOpen(true);
    } else if (this.sezioneAttiva === 'materie') {
      this.setModalMaterieOpen(true);
    }
  }

  vediMateriale(materia: any) {
    this.nomeMateriaSelezionata = materia.nome_materia || 'Materiale Didattico';
    this.idMateriaSelezionata = materia.id || materia.id_materia; 
    this.isModalMaterialeOpen = true;
    
    this.caricaMateriale();
  }

  caricaMateriale() {
    this.isLoadingMateriale = true;
    this.materialeMateria = [];
    
    this.http.get<any[]>("http://localhost:3000/api/materiale/" + this.idMateriaSelezionata).subscribe({
      next: (data) => {
        this.materialeMateria = data;
        this.isLoadingMateriale = false;
      },
      error: (err) => {
        console.error("Errore recupero materiale:", err);
        this.isLoadingMateriale = false;
      }
    });
  }

  apriNuovoMateriale() {
    this.nuovoMateriale = { titolo: '', tipo_file: 'pdf', url_file: '' };
    this.isModalNuovoMaterialeOpen = true;
  }

  salvaMateriale() {
    const payload = {
      id_materia: this.idMateriaSelezionata,
      titolo: this.nuovoMateriale.titolo,
      tipo_file: this.nuovoMateriale.tipo_file,
      url_file: this.nuovoMateriale.url_file
    };

    this.http.post("http://localhost:3000/api/materiale", payload).subscribe({
      next: () => {
        this.isModalNuovoMaterialeOpen = false;
        this.caricaMateriale(); 
      },
      error: (err) => console.error("Errore salvataggio materiale:", err)
    });
  }

  getIconaFile(tipo: string): string {
    switch(tipo?.toLowerCase()) {
      case 'pdf': return 'document-text'; 
      case 'slide': return 'easel'; 
      case 'zip': return 'archive'; 
      case 'link': return 'link';
      default: return 'document'; 
    }
  }

  controllaVoto() {
    if (this.nuovoEsame.voto !== 30) {
      this.nuovoEsame.lode = false;
    }
  }

  correggiVoto() {
    let voto = Number(this.nuovoEsame.voto);

    if (!this.nuovoEsame.voto) return;

    if (voto < 18) {
      this.nuovoEsame.voto = 18;
    } else if (voto > 30) {
      this.nuovoEsame.voto = 30;
    }

    this.controllaVoto();
  }

  validaAnnoData() {
    if (!this.nuovoEsame.data_superamento) return false;
    
    const dataScelta = new Date(this.nuovoEsame.data_superamento).getTime();
    const limiteMin = new Date(this.minData).getTime();
    const limiteMax = new Date(this.maxData).getTime();
    
    return dataScelta >= limiteMin && dataScelta <= limiteMax;
  }
  
  apriGraficoTorta() {
    this.isModalTortaOpen = true;

    setTimeout(() => {
      
      const conteggioVoti: any = {};
      this.esamiSuperati.forEach(esame => {
        let etichettaVoto = esame.voto.toString();
        if(esame.voto === 30 && (esame.lode === 1 || esame.lode === true)){
          etichettaVoto = '30L'
        }
        conteggioVoti[etichettaVoto] = (conteggioVoti[etichettaVoto] || 0) + 1;
      });

      const etichette = Object.keys(conteggioVoti).map(v => 'Voto ' + v);
      const dati = Object.values(conteggioVoti);

      const stileApp = getComputedStyle(document.body);
      const primaryRgb = stileApp.getPropertyValue('--ion-color-primary-rgb').trim() || '56, 128, 255';

      const opacitaMinima = 0.3;
      const stepOpacita = dati.length > 1 ? (1 - opacitaMinima) / (dati.length - 1) : 0;

      const sfumaturePrimary = dati.map((_, indice) => {
        const opacita = dati.length === 1 ? 1 : opacitaMinima + (indice * stepOpacita);
        return `rgba(${primaryRgb}, ${opacita})`; 
      });

      if (this.graficoTorta) {
        this.graficoTorta.destroy();
      }

      const canvas = document.getElementById('graficoTorta') as HTMLCanvasElement;
      this.graficoTorta = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: etichette,
          datasets: [{
            data: dati,
            backgroundColor: sfumaturePrimary,
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1,
          
          layout: {
            padding: { bottom: 15 } 
          },

          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });
    }, 200);
  }
  
  

apriGraficoAndamento() {
    this.isModalAndamentoOpen = true;

    setTimeout(() => {
      const esamiOrdinati = [...this.esamiSuperati]
        .filter(e => e.data_superamento)
        .sort((a, b) => new Date(a.data_superamento).getTime() - new Date(b.data_superamento).getTime());

      const etichette = esamiOrdinati.map(e => {
        const data = new Date(e.data_superamento);
        return data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
      });

      const dati = esamiOrdinati.map(e => {
        return (e.voto === 30 && (e.lode === 1 || e.lode === true)) ? 32 : e.voto;
      });

      const stileApp = getComputedStyle(document.body);
      const primaryRgb = stileApp.getPropertyValue('--ion-color-primary-rgb').trim() || '56, 128, 255';

      const convertiStringaRgbInHex = (stringaRgb: string) => {
        const numeri = stringaRgb.match(/\d+/g);
        if (!numeri || numeri.length < 3) return '#3880ff';
        const r = parseInt(numeri[0], 10);
        const g = parseInt(numeri[1], 10);
        const b = parseInt(numeri[2], 10);
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
      };

      const primaryHex = convertiStringaRgbInHex(primaryRgb);

      if (this.graficoAndamento) {
        this.graficoAndamento.destroy();
      }

      const canvas = document.getElementById('graficoAndamento') as HTMLCanvasElement;
      this.graficoAndamento = new Chart(canvas, {
        type: 'line',
        data: {
          labels: etichette,
          datasets: [{
            label: 'Voto',
            data: dati,
            borderColor: primaryHex,
            backgroundColor: primaryHex + '33',
            borderWidth: 3,
            pointBackgroundColor: primaryHex,
            pointRadius: 5,
            fill: true,
            tension: 0.4,
            cubicInterpolationMode: 'monotone'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.4,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y === 32) {
                    label += '30L';
                  } else {
                    label += context.parsed.y;
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              min: 17, 
              max: 33, 
              ticks: {
                stepSize: 1,
                autoSkip: false,
                callback: function(value) {
                  if (value === 32) return '30L';
                  if (value === 30) return '30';
                  if (typeof value === 'number' && value >= 18 && value < 30 && value % 2 === 0) {
                    return value;
                  }
                  return '';
                }
              }
            }
          }
        }
      });
    }, 200);
  }

  apriMenu() {
    this.menuCtrl.open();
  }
}