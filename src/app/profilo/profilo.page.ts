import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.page.html',
  styleUrls: ['./profilo.page.scss'],
  standalone: false
})
export class ProfiloPage implements OnInit {

  idStudente: string | null = null;
  profilo: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  dataNascitaSelezionata: string = '';
  minDataNascita: string = '';
  maxDataNascita: string = '';
  sessoSelezionato: string = '';
  
  passwordForm!: FormGroup;
  
  
  showVecchia: boolean = false;
  showNuova: boolean = false;
  showConferma: boolean = false;

  defaultAvatar: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private fb: FormBuilder 
  ) { }

  ngOnInit() {
    this.idStudente = localStorage.getItem('id');

    const oggi = new Date();

    const dataMax = new Date(oggi.getFullYear() - 18, oggi.getMonth(), oggi.getDate());
    this.maxDataNascita = dataMax.toISOString().split('T')[0];

    const dataMin = new Date(oggi.getFullYear() - 100, oggi.getMonth(), oggi.getDate());
    this.minDataNascita = dataMin.toISOString().split('T')[0];

    this.passwordForm = this.fb.group({
      vecchiaPassword: [''],
      nuovaPassword: ['', [Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)]],
      confermaPassword: ['']
    }, { validators: this.passwordsMatchValidator });

    this.caricaDatiProfilo();
  }

  passwordsMatchValidator(group: AbstractControl) {
    const pass = group.get('nuovaPassword')?.value;
    const conf = group.get('confermaPassword')?.value;
    if (pass && conf && pass !== conf) {
      group.get('confermaPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  get f() { return this.passwordForm.controls; }

  caricaDatiProfilo() {
    if (!this.idStudente) return;

    this.http.get<any>(`http://localhost:3000/api/studenti/profilo/${this.idStudente}`).subscribe({
      next: (data) => {
        this.profilo = data;
        if (data.data_nascita) {
          this.dataNascitaSelezionata = data.data_nascita;
        }
        if (data.sesso) {
          this.sessoSelezionato = data.sesso;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Errore", err);
        this.isLoading = false;
      }
    });
  }

  cambiaFotoProfilo(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profilo.foto_profilo = reader.result as string; 
      };
      reader.readAsDataURL(file);
    }
  }

  toggleVecchia() { this.showVecchia = !this.showVecchia; }
  toggleNuova() { this.showNuova = !this.showNuova; }
  toggleConferma() { this.showConferma = !this.showConferma; }

  rimuoviFotoProfilo(event: Event) {
    event.stopPropagation(); 
    this.profilo.foto_profilo = null; 
  }

  salvaModifiche() {
    if (!this.idStudente) return;
    this.errorMessage = '';

    const payload: any = {
      data_nascita: this.dataNascitaSelezionata,
      sesso: this.sessoSelezionato,
      foto_profilo: this.profilo.foto_profilo
    };

    const vecchia = this.passwordForm.value.vecchiaPassword;
    const nuova = this.passwordForm.value.nuovaPassword;
    const conferma = this.passwordForm.value.confermaPassword;

    if (nuova || vecchia || conferma) {
      if (!vecchia || !nuova || !conferma) {
        this.errorMessage = 'Per cambiare password devi compilare tutti e tre i campi.';
        return;
      }
      if (this.passwordForm.invalid) {
        this.errorMessage = 'Risolvi gli errori nella password prima di salvare.';
        return;
      }
      
      payload.vecchiaPassword = vecchia;
      payload.nuovaPassword = nuova;
    }

    this.http.put(`http://localhost:3000/api/studenti/profilo/${this.idStudente}`, payload).subscribe({
      next: async () => {
        localStorage.setItem('foto', this.profilo.foto_profilo);
        this.passwordForm.reset(); 
        this.mostraToast('Profilo aggiornato con successo!', 'success');
      },
      error: async (err) => {
        this.errorMessage = err.error?.message || 'Errore durante il salvataggio.';
      }
    });
  }

  async mostraToast(messaggio: string, colore: string) {
    const toast = await this.toastCtrl.create({
      message: messaggio,
      duration: 2500,
      color: colore,
      position: 'bottom'
    });
    await toast.present();
  }
}