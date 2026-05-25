import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.idStudente = localStorage.getItem('id');
    this.caricaNews();
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
      error: (err) => {
        event.target.complete();
      }
    });
  }
}