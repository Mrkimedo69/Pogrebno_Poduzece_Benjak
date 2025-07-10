import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { Observable, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthStore, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/auth']); 
      return false;
    }
  }
}
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthStore, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAdmin()) return true;
    this.router.navigate(['/']);
    return false;
  }
}
@Injectable({ providedIn: 'root' })
export class EmployeeGuard implements CanActivate {
  constructor(private auth: AuthStore, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.isEmployee()) {
      if (state.url.startsWith('/narudzbe')) {
        return true;
      } else {
        this.router.navigate(['/narudzbe']);
        return false;
      }
    }

    this.router.navigate(['/']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthRedirectGuard implements CanActivate {
  constructor(private auth: AuthStore, private router: Router) {}

  canActivate(): boolean {
    const user = this.auth.user();

    if (user?.role === 'employee') {
      this.router.navigate(['/narudzbe']);
      return false;
    }

    return true;
  }
}




