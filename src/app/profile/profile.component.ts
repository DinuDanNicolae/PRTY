import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { Auth, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  template: `
    <div *ngIf="user">
      <h1>Welcome to your profile</h1>
      <p>Hello, {{ user.displayName || 'User' }}</p>
      <p>Your email: {{ user.email }}</p>
      <button (click)="logout()">Logout</button>
    </div>
  `,
  styles: [
    `
      div {
        text-align: center;
        margin-top: 50px;
      }
      button {
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
      }
    `,
  ],
})
export class ProfileComponent {
  user: User | null = null;

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      this.user = user;
    });
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        alert('Logged out successfully!');
        this.router.navigate(['/login']); // Redirect to login after logout
      })
      .catch((error) => {
        console.error('Error logging out:', error.message);
        alert('Logout failed: ' + error.message);
      });
  }
}
