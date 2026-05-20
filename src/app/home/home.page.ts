import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  saluto: string = 'Benvenuto';
  nomeStudente: string = 'Studente';
  idStudente: string | null = null;

  lezioniOggi: any[] = [];
  lezioniFiltrate: any[] = []; 
  annoSelezionato: string = '1';
  tasks: any[] = [];
  
  isLoadingLezioni: boolean = true;
  isLoadingTasks: boolean = true;

  constructor(
    private http: HttpClient, 
    private alertController: AlertController,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit() {
    this.nomeStudente = localStorage.getItem('nome') || 'Studente';
    this.idStudente = localStorage.getItem('id');

    this.calcolaSaluto();
    this.caricaLezioniOggi();
    this.caricaTasksStudente();
  }

  calcolaSaluto() {
    const ora = new Date().getHours();
    if (ora >= 5 && ora < 12) {
      this.saluto = 'Buongiorno';
    } else if (ora >= 12 && ora < 18) {
      this.saluto = 'Buon pomeriggio';
    } else {
      this.saluto = 'Buonasera';
    }
  }

  caricaLezioniOggi() {
    if (!this.idStudente) {
      this.isLoadingLezioni = false;
      return;
    }

    this.http.get<any[]>(`http://localhost:3000/api/lezioni/oggi/${this.idStudente}`).subscribe({
      next: (data) => {
        this.lezioniOggi = data;
        this.filtraLezioni();
        this.isLoadingLezioni = false;
      },
      error: (err) => {
        console.error("Errore lezioni:", err);
        this.isLoadingLezioni = false;
      }
    });
  }

  filtraLezioni() {
    const anno = parseInt(this.annoSelezionato, 10);
    this.lezioniFiltrate = this.lezioniOggi.filter(lezione => lezione.anno === anno);
  }

  caricaTasksStudente() {
    if (!this.idStudente) {
      this.isLoadingTasks = false;
      return; 
    }

    this.http.get<any[]>(`http://localhost:3000/api/tasks/studente/${this.idStudente}`).subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoadingTasks = false;
      },
      error: (err) => {
        console.error("Errore tasks:", err);
        this.isLoadingTasks = false;
      }
    });
  }

  toggleTask(task: any) {
    const nuovoStato = task.completato === 1 ? 0 : 1; 

    this.http.put(`http://localhost:3000/api/tasks/${task.id}/toggle`, { completato: nuovoStato }).subscribe({
      next: () => {
        task.completato = nuovoStato; 
      },
      error: (err) => {
        console.error("Errore aggiornamento task:", err);
      }
    });
  }

  async mostraPopupNuovaTask() {
    const alert = await this.alertController.create({
      header: 'Nuova Attività',
      message: 'Cosa devi studiare o fare oggi?',
      inputs: [
        { name: 'testo', type: 'text', placeholder: 'Es. Ripasso Analisi 1...' }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Aggiungi', 
          handler: (datiPopup) => {
            if (datiPopup.testo && datiPopup.testo.trim() !== '') {
              this.salvaTaskNelDB(datiPopup.testo);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  salvaTaskNelDB(testo: string) {
    if (!this.idStudente) {
      alert("Memoria corrotta! Clicca sull'icona in alto a destra per fare Logout e riaccedere.");
      return; 
    }

    const payload = {
      testo: testo,
      id_studente: parseInt(this.idStudente, 10) 
    };

    this.http.post<any>('http://localhost:3000/api/tasks', payload).subscribe({
      next: (res) => {
        const nuovaTask = {
          id: res.id,
          testo: testo,
          completato: 0,
          importante: 0,
          id_studente: payload.id_studente
        };

        this.tasks = [nuovaTask, ...this.tasks];
        
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Errore server creazione task:", err);
      }
    });
  }

  eliminaTask(idTask: number) {
    this.http.delete(`http://localhost:3000/api/tasks/${idTask}`).subscribe({
      next: () => {
        // Togliamo la task dall'array grafico
        this.tasks = this.tasks.filter(t => t.id !== idTask);
        this.cdr.detectChanges(); // Aggiorniamo la grafica
      },
      error: (err) => {
        console.error("Errore durante l'eliminazione:", err);
      }
    });
  }

  toggleImportanza(task: any) {
    const nuovoStato = task.importante === 1 ? 0 : 1;

    this.http.put(`http://localhost:3000/api/tasks/${task.id}/importanza`, { importante: nuovoStato }).subscribe({
      next: () => {
        task.importante = nuovoStato;
        
        this.tasks.sort((a, b) => {
          if (a.importante === b.importante) {
            return b.id - a.id; 
          }
          return b.importante - a.importante;
        });

        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento importanza:", err);
      }
    });
  }

  logout() {
    localStorage.clear(); 
    this.router.navigate(['/login']); 
  }
}