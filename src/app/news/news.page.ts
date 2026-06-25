import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
  standalone: false
})
export class NewsPage implements OnInit {

  newsList: any[] = [];
  isLoading: boolean = true;
  idStudente: string | null = null; 
  constructor(private http: HttpClient, private menuCtrl: MenuController) { }

  ngOnInit() {
    this.idStudente = localStorage.getItem('id');
  }

  ionViewWillEnter() {
    if (!this.idStudente) {
      this.idStudente = localStorage.getItem('id');
    }
    this.caricaNews();
  }

  caricaNews() {
    if (!this.idStudente) return;
    
    this.isLoading = true;
    this.http.get<any[]>(`http://localhost:3000/api/news/studente/${this.idStudente}`).subscribe({
      next: (data) => {
        this.newsList = data;
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        console.error("Errore durante il caricamento delle news:", err);
        this.isLoading = false;
      }
    });
  }

  doRefresh(event: any) {
    if (!this.idStudente) {
      event.target.complete();
      return;
    }

    this.http.get<any[]>(`http://localhost:3000/api/news/studente/${this.idStudente}`).subscribe({
      next: (data) => {
        this.newsList = data;
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }
  
  apriMenu() {
    this.menuCtrl.open();
  }
}