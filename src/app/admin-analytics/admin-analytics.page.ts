import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

Chart.defaults.font.family = "'Montserrat', sans-serif";

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.page.html',
  styleUrls: ['./admin-analytics.page.scss'],
  standalone: false
})
export class AdminAnalyticsPage implements OnInit {

  isLoading: boolean = true;
  corsi: any[] = [];
  filtroCorso: string = 'globale';

  stats: any = {
    totaleStudenti: 0,
    mediaVoti: 0,
    totaleMateriale: 0,
    totaleAnnunci: 0,
    tickets: { 'Aperto': 0, 'In Carico': 0, 'Risolto': 0, 'Totale': 0 }
  };

  graficoVoti: any;
  graficoTickets: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.caricaCorsi();
    this.caricaAnalytics();
  }

  ionViewWillEnter() {
    this.caricaAnalytics();
  }

  caricaCorsi() {
    this.http.get<any[]>('http://localhost:3000/api/admin/corsi').subscribe({
      next: (data) => this.corsi = data,
      error: (err) => console.error("Errore caricamento corsi", err)
    });
  }

  cambiaFiltro() {
    this.caricaAnalytics();
  }

  caricaAnalytics(event?: any) {
    this.isLoading = true;
    
    this.http.get<any>(`http://localhost:3000/api/admin/analytics?id_corso=${this.filtroCorso}`).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        
        setTimeout(() => {
          this.disegnaGrafici();
        }, 300);

        if (event) event.target.complete();
      },
      error: (err) => {
        console.error("Errore recupero analytics:", err);
        this.isLoading = false;
        if (event) event.target.complete();
      }
    });
  }

  doRefresh(event: any) {
    this.caricaAnalytics(event);
  }

  disegnaGrafici() {
    this.disegnaGraficoVoti();
    this.disegnaGraficoTickets();
  }

  disegnaGraficoVoti() {
    if (this.graficoVoti) this.graficoVoti.destroy();
    
    const canvas = document.getElementById('graficoVoti') as HTMLCanvasElement;
    if (!canvas) return;

    this.graficoVoti = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Sufficiente (18-22)', 'Buono (23-26)', 'Ottimo (27-30L)'],
        datasets: [{
          data: [
            this.stats.distribuzioneVoti['18-22'], 
            this.stats.distribuzioneVoti['23-26'], 
            this.stats.distribuzioneVoti['27-30L']
          ],
          backgroundColor: ['#e74c3c', '#f1c40f', '#2ecc71'], 
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        cutout: '65%' 
      }
    });
  }

  disegnaGraficoTickets() {
    if (this.graficoTickets) this.graficoTickets.destroy();

    const canvas = document.getElementById('graficoTickets') as HTMLCanvasElement;
    if (!canvas) return;

    this.graficoTickets = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Aperti', 'In Carico', 'Risolti'],
        datasets: [{
          label: 'Numero Segnalazioni',
          data: [
            this.stats.tickets['Aperto'], 
            this.stats.tickets['In Carico'], 
            this.stats.tickets['Risolto']
          ],
          backgroundColor: ['#eb445a', '#ffc409', '#2dd36f'], 
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }, 
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } } 
        }
      }
    });
  }
}