import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  emailInput: string = '';
  passwordInput: string = '';
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off-outline';
  isLoading: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  isEmailValid(): boolean {
    const emailRegex = /^[a-z]+\.[a-z]+(0[1-9]|[1-9][0-9])?@(community|you)\.unipa\.it$/;
    return emailRegex.test(this.emailInput);
  }

  isPasswordValid(): boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(this.passwordInput);
  }

  isFormValid(): boolean {
    return this.isEmailValid() && this.isPasswordValid();
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

  accedi() {
    if (!this.isFormValid()) return;

    this.isLoading = true; 
    console.log("Accesso Istituzionale in corso...");
    
    setTimeout(() => {
      this.isLoading = false; 
      this.router.navigate(['/home']); 
    }, 1500);
  }
}