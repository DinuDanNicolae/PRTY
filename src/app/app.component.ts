import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service'; // Import the AuthService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav>
      <!-- Navbar for logged-out users -->
      <ng-container *ngIf="!isAuthenticated; else loggedInNav">
       
      </ng-container>

      <!-- Navbar for logged-in users -->
      <ng-template #loggedInNav>
        <a routerLink="/profile">Profile</a>
        <a routerLink="/map">Map</a>
        <a routerLink="/friends">Friends</a>
      </ng-template>
    </nav>

    <router-outlet></router-outlet>
  `,
  styles: [
    `
      nav {
        background-color: #f8f9fa;
        padding: 10px;
        text-align: center;
      }
      nav a,
      nav button {
        margin: 0 15px;
        text-decoration: none;
        color: #007bff;
        cursor: pointer;
      }
      nav button {
        background: none;
        border: none;
        color: #007bff;
        font-size: 16px;
      }
      nav a:hover,
      nav button:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to the authentication state
    this.authService.isAuthenticated$.subscribe(
      (authState: boolean) => (this.isAuthenticated = authState)
    );
  }

  logout() {
    this.authService.logout(); // Trigger logout in AuthService
  }
}