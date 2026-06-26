import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {

  registerForm!: FormGroup;
  passwordType: string = 'password';
  confirmPasswordType: string = 'password'
  passwordIcon: string = 'eye-off-outline';
  confirmPasswordIcon: string = 'eye-off-outline';
  isLoading: boolean = false;

  corsi: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const annoCorrente = new Date().getFullYear();

    this.http.get<any[]>('http://localhost:3000/api/corsi').subscribe({
      next: (data) => {
        this.corsi = data;
      },
      error: (err) => {
        console.error("Errore nel caricamento dei corsi dal database:", err);
      }
    });

    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-z]+\.[a-z]+(0[1-9]|[1-9][0-9])?@(community|you)\.unipa\.it$/)
      ]],
      matricola: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]{5,10}$/)
      ]],
      anno_immatricolazione: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{4}$/),
        Validators.min(2000),
        Validators.max(annoCorrente)
      ]],
      id_corso: ['', [Validators.required]],
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get f() { return this.registerForm.controls; }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  togglePassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
      this.passwordIcon = 'eye-outline';
    } else {
      this.passwordType = 'password';
      this.passwordIcon = 'eye-off-outline';
    }
  }

  toggleConfirmPassword() {
    if (this.confirmPasswordType === 'password') {
      this.confirmPasswordType = 'text';
      this.confirmPasswordIcon = 'eye-outline';
    } else {
      this.confirmPasswordType = 'password';
      this.confirmPasswordIcon = 'eye-off-outline';
    }
  }

  estraiDatiDaEmail(email: string) {
    const prefisso = email.split('@')[0]; 
    const parti = prefisso.split('.');    
    
    let nomeRaw = parti[0];
    let cognomeRaw = parti[1] || '';

    cognomeRaw = cognomeRaw.replace(/[0-9]/g, '');
    const nome = nomeRaw.charAt(0).toUpperCase() + nomeRaw.slice(1);
    const cognome = cognomeRaw.charAt(0).toUpperCase() + cognomeRaw.slice(1);

    return { nome, cognome };
  }

  registrati() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues = this.registerForm.value;
    
    const { nome, cognome } = this.estraiDatiDaEmail(formValues.email);

    const nuovoStudente = {
      nome: nome,
      cognome: cognome,
      email: formValues.email,
      password: formValues.password,
      matricola: formValues.matricola,
      anno_immatricolazione: parseInt(formValues.anno_immatricolazione),
      id_corso: parseInt(formValues.id_corso)
    };

    this.http.post<any>('http://localhost:3000/api/auth/register', nuovoStudente).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Registrazione completata con successo! Reindirizzamento...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Si è verificato un errore durante la registrazione.';
        console.error("Errore di registrazione:", err);
      }
    });
  }
}
