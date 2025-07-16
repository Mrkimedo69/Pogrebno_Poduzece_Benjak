import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.services';
import { AuthStore } from '../../../../store/auth.store';
import { CartStore } from '../../../../../features/components/cart/store/cart.store';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  authMode: 'login' | 'register' = 'login';
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authStore: AuthStore,
    private cartStore: CartStore,
    private router: Router
  ) {
    this.form = this.buildForm();
  }

  buildForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      fullName: [''],
    });
  }

  toggleMode() {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
    this.errorMessage = '';
    this.form.reset();
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, password, fullName } = this.form.value;

    try {
      if (this.authMode === 'login') {
        const res = await this.authService.login({ email, password }).toPromise();

        if (res?.access_token && res?.user) {
          this.authStore.login(res.user, res.access_token);
        }

        this.router.navigate(['/']);
      } else {
        const regRes = await this.authService.register({ email, password, fullName }).toPromise();

        const loginRes = await this.authService.login({ email, password }).toPromise();

        if (loginRes?.access_token && loginRes?.user) {
          this.authStore.login(loginRes.user, loginRes.access_token);
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
