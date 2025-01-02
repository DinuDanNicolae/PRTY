import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav class="navbar">
      <div class="brand">
        <a routerLink="/">Let's PRTY</a>
      </div>
      <div class="nav-links">
        <!-- Navbar for logged-out users -->
        <ng-container *ngIf="!isAuthenticated; else loggedInNav">
          <a routerLink="/login">Login</a>
          <a routerLink="/register">Register</a>
        </ng-container>

        <!-- Navbar for logged-in users -->
        <ng-template #loggedInNav>
          <a routerLink="/profile">Profile</a>
          <a routerLink="/map">Map</a>
          <a routerLink="/friends">Friends</a>
          <button (click)="logout()">Logout</button>
        </ng-template>
      </div>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      /* General Navbar Styles */
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background-color: #1b263b; /* Dark blue background */
        color: #e0e1dd; /* Light text */
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      /* Brand/Logo */
      .brand a {
        font-size: 1.5rem;
        font-weight: bold;
        color: #e0e1dd; /* Light text */
        text-decoration: none;
      }

      .brand a:hover {
        color: #778da9; /* Muted blue hover */
      }

      /* Nav Links */
      .nav-links {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .nav-links a {
        text-decoration: none;
        color: #e0e1dd; /* Light text */
        font-size: 1rem;
        padding: 8px 15px;
        border-radius: 5px;
        transition: background-color 0.3s, color 0.3s;
      }

      .nav-links a:hover {
        background-color: #415a77; /* Muted blue hover */
        color: #e0e1dd;
      }

      /* Button Styles */
      .nav-links button {
        background-color: #415a77;
        color: #e0e1dd;
        font-size: 1rem;
        padding: 8px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
      }

      .nav-links button:hover {
        background-color: #778da9; /* Lighter blue */
        color: #fff;
      }

      .nav-links button:focus {
        outline: 2px solid #e0e1dd;
      }
    `,
  ],
})

export class AppComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit() {
    this.authService.isAuthenticated$.subscribe((authState) => {
      if (authState !== null) {
        this.isAuthenticated = authState;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}