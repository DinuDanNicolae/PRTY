import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav>
      <!-- Navbar for logged-out users -->
      <ng-container *ngIf="!isAuthenticated; else loggedInNav">
        <div class="nav-links">
          <a routerLink="/login">Login</a>
          <a routerLink="/register">Register</a>
        </div>
      </ng-container>

      <!-- Navbar for logged-in users -->
      <ng-template #loggedInNav>
        <div class="nav-links">
          <a routerLink="/profile">Profile</a>
          <a routerLink="/map">Map</a>
          <a routerLink="/friends">Friends</a>
          <button (click)="logout()">Logout</button>
        </div>
      </ng-template>
    </nav>

    <router-outlet></router-outlet>
  `,
  styles: [
    `
      nav {
        background-color: #f8f9fa;
        padding: 15px;
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #ddd;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      nav a {
        text-decoration: none;
        color: #007bff;
        font-size: 16px;
        padding: 5px 10px;
        border: 1px solid transparent;
        border-radius: 5px;
        transition: all 0.3s ease;
      }

      nav a:hover {
        background-color: #e7f1ff;
        border-color: #007bff;
      }

      nav button {
        background-color: #007bff;
        color: white;
        font-size: 16px;
        padding: 5px 15px;
        border: 1px solid #007bff;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      nav button:hover {
        background-color: white;
        color: #007bff;
      }

      nav button:focus {
        outline: 2px solid #0056b3;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe((authState) => {
      if (authState !== null) {
        this.isAuthenticated = authState;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
