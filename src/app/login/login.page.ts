import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(
    private router: Router,
    private fb: FormBuilder
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
    console.log("Accesso Istituzionale in corso...");
    
    setTimeout(() => {
      this.isLoading = false; 
      this.router.navigate(['/home']); 
    }, 1500);
  }
}