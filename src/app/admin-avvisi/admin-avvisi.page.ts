import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-avvisi',
  templateUrl: './admin-avvisi.page.html',
  styleUrls: ['./admin-avvisi.page.scss'],
  standalone: false
})
export class AdminAvvisiPage implements OnInit{

  // L'oggetto che contiene i dati del form
  nuovaNews = {
    titolo: '',
    contenuto: '',
    tipo: 'Generale'
  };

  listaNews: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.caricaNews();
  }

  ionViewWillEnter() {
    this.caricaNews();
  }

  caricaNews() {
    this.http.get(`http://localhost:3000/api/admin/news`).subscribe((data: any) => {
      this.listaNews = data;
    });
  }

  eliminaAvviso(id: any) {
    const token = localStorage.getItem('token');
    
    if (!id) {
      console.error("--- ERRORE: ID non definito o nullo!");
      return;
    }
    
    this.http.delete(`http://localhost:3000/api/admin/news/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert("Avviso eliminato");
        this.caricaNews();
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        console.error("Errore eliminazione:", err)
      }
    });
  }

  diramaAvviso() {
    if (!this.nuovaNews.titolo || !this.nuovaNews.contenuto) return;

    this.http.post('http://localhost:3000/api/news', this.nuovaNews).subscribe({
      next: (response: any) => {
        alert(response.messaggio);
        // Svuota il form dopo l'invio:
        this.nuovaNews = { titolo: '', contenuto: '', tipo: 'Generale' };
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          alert("Sessione scaduta per inattività. Effettua nuovamente il login.");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        alert("Errore del server: " + (err.error?.errore || err.error?.error || "Impossibile inviare"));
      }
    });
  }

  doRefresh(event: any) {
    this.ionViewWillEnter();
    
    setTimeout(() => {
      event.target.complete();
    }, 500); 
  }
}