import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState = new BehaviorSubject<boolean | null>(null);
  isAuthenticated$ = this.authState.asObservable();

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      this.authState.next(!!user);
    });
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        console.log('User logged out');
        this.authState.next(false);
      })
      .catch((error) => {
        console.error('Logout error:', error.message);
      });
  }
}
