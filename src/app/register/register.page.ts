import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-z]+\.[a-z]+(0[1-9]|[1-9][0-9])?@(community|you)\.unipa\.it$/)
      ]],
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

  registrati() {
    if (this.registerForm.invalid) return;

    this.isLoading = true; 
    console.log("Registrazione Istituzionale in corso...");
    
    setTimeout(() => {
      this.isLoading = false; 
      this.router.navigate(['/login']); 
    }, 1500);
  }

}
