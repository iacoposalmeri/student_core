import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-avvisi',
  templateUrl: './admin-avvisi.page.html',
  styleUrls: ['./admin-avvisi.page.scss'],
  standalone: false
})
export class AdminAvvisiPage {

  // L'oggetto che contiene i dati del form
  nuovaNews = {
    titolo: '',
    contenuto: '',
    tipo: 'Generale'
  };

  constructor(private http: HttpClient) {}

  diramaAvviso() {
    // Controllo rapido che i campi non siano vuoti
    if (!this.nuovaNews.titolo || !this.nuovaNews.contenuto) {
      alert("Per favore, compila titolo e contenuto.");
      return;
    }

    // Invio al server
    this.http.post('http://localhost:3000/api/news', this.nuovaNews).subscribe({
      next: (response: any) => {
        alert("Avviso pubblicato con successo!");
        // Reset del form dopo l'invio
        this.nuovaNews = { titolo: '', contenuto: '', tipo: 'Generale' };
      },
      error: (err) => {
        console.error(err);
        alert("Errore durante la pubblicazione: " + (err.error?.message || "Controlla il server"));
      }
    });
  }
}