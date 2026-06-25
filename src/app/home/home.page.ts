import { Component, ChangeDetectorRef } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { AlertController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router'; 


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage {

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
    private cdr: ChangeDetectorRef,
    private menuCtrl: MenuController
  ) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  ionViewWillEnter() {
    this.nomeStudente = localStorage.getItem('nome') || 'Studente';
    this.idStudente = localStorage.getItem('id');

    this.calcolaSaluto();
    this.caricaLezioniOggi();
    this.caricaTasksStudente();
  }

  calcolaSaluto() {
    const ora = new Date().getHours();
    if (ora >= 5 && ora < 13) {
      this.saluto = 'Buongiorno';
    } else if (ora >= 13 && ora < 18) {
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

    const headers = this.getAuthHeaders();

    this.http.get<any[]>(`http://localhost:3000/api/lezioni/oggi/${this.idStudente}`, headers).subscribe({
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

    const headers = this.getAuthHeaders();

    this.http.get<any[]>(`http://localhost:3000/api/tasks/studente/${this.idStudente}`, headers).subscribe({
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
        this.riordinaTasks();
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
      cssClass: 'custom-task-alert',
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

        this.tasks.push(nuovaTask);
        
        this.riordinaTasks();
        
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
        
        this.riordinaTasks();

        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento importanza:", err);
      }
    });
  }

  riordinaTasks() {
    this.tasks.sort((a, b) => {
      if (a.completato !== b.completato) {
        return a.completato - b.completato;
      }
      if (a.importante !== b.importante) {
        return b.importante - a.importante; 
      }
      return b.id - a.id; 
    });
    
    this.cdr.detectChanges(); 
  }

  async modificaTask(task: any) {
    const alert = await this.alertController.create({
      header: 'Modifica Attività',
      cssClass: 'custom-task-alert',
      inputs: [
        { 
          name: 'testo', 
          type: 'text', 
          value: task.testo,
          placeholder: 'Modifica testo...' 
        }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { 
          text: 'Salva', 
          handler: (datiPopup) => {
            if (datiPopup.testo && datiPopup.testo.trim() !== '' && datiPopup.testo !== task.testo) {
              this.aggiornaTestoTasknelDB(task, datiPopup.testo.trim());
            }
          }
        }
      ]
    });
    await alert.present();
  }

  aggiornaTestoTasknelDB(task: any, nuovoTesto: string) {
    this.http.put(`http://localhost:3000/api/tasks/${task.id}/testo`, { testo: nuovoTesto }).subscribe({
      next: () => {
        task.testo = nuovoTesto;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Errore modifica testo task:", err);
      }
    });
  }

  async leggiTaskIntera(task: any) {
    const alert = await this.alertController.create({
      header: 'Dettaglio Attività',
      message: task.testo,
      buttons: ['Chiudi'],
      cssClass: 'custom-task-alert'
    });
    await alert.present();
  }

  apriMenu() {
    this.menuCtrl.open();
  }

  doRefresh(event: any) {
    this.ionViewWillEnter(); // <-- GENIALE: Richiama la funzione che ricarica già tutti i dati!
    
    setTimeout(() => {
      event.target.complete(); // Dopo mezzo secondo, nasconde la rotellina
    }, 500); 
  }
}