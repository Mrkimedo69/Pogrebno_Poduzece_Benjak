import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.services';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  authMode: 'login' | 'register' = 'login';
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.buildForm();
  }

  buildForm() {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      fullName: [''], 
    });
  }

  toggleMode() {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
    this.errorMessage = '';
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    try {
      if (this.authMode === 'login') {
        const res = await this.authService.login({          
          email: this.form.value.email,
          password: this.form.value.password, 
        }).toPromise();
        if (res?.access_token) {
          this.authService.storeToken(res.access_token);
          this.authService.storeUser(res.user);
        }
        this.router.navigate(['/']);
      } else {
        const res = await this.authService.register({
          email: this.form.value.email,
          password: this.form.value.password,
          fullName: this.form.value.fullName,
        }).toPromise();

        const loginRes = await this.authService.login({           
          email: this.form.value.email,
          password: this.form.value.password,
        }).toPromise();
        if (loginRes?.access_token) {
          this.authService.storeToken(loginRes.access_token);
          this.authService.storeUser(loginRes.user);
        }
        
        this.router.navigate(['/']);
      }
    } catch (err) {
      this.errorMessage = 'Greška pri autentifikaciji';
    } finally {
      this.loading = false;
    }
  }
}
