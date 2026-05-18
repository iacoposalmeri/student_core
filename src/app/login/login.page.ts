import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off-outline';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-z]+\.[a-z]+(0[1-9]|[1-9][0-9])?@(community|you)\.unipa\.it$/)
      ]],
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      ]]
    })
  }

  get f() { return this.loginForm.controls; }

  togglePassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
      this.passwordIcon = 'eye-outline';
    } else {
      this.passwordType = 'password';
      this.passwordIcon = 'eye-off-outline';
    }
  }

  accedi() {
    if (this.loginForm.invalid) return;

    this.isLoading = true; 
    this.errorMessage = ''; // Resetta l'errore a ogni nuovo tentativo
    
    // Recuperiamo l'oggetto con email e password digitate dall'utente
    const credenziali = this.loginForm.value;

    // Facciamo una richiesta POST al nostro server Node.js
    this.http.post<any>('http://localhost:3000/api/auth/login', credenziali).subscribe({
      next: (response) => {
        this.isLoading = false; 
        
        // Smistamento intelligente in base al ruolo restituito dal backend
        if (response.ruolo === 'admin') {
          console.log("Benvenuto Amministratore:", response.nome);
          this.router.navigate(['/admin-home']);
        } else {
          console.log("Benvenuto Studente:", response.nome);
          this.router.navigate(['/home']); 
        }
      },
      error: (err) => {
        this.isLoading = false; 
        // Se il server restituisce errore (es. 401 password errata), attiviamo il banner
        this.errorMessage = 'Email o password errate. Riprova.';
        console.error("Errore durante l'autenticazione:", err);
      }
    });
  }
}