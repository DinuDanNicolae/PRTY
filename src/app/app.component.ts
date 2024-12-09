import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], // Import RouterModule for routing
  template: `
    <nav>
      <a routerLink="/login">Login</a> | 
      <a routerLink="/home">Home</a>
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

      nav a {
        margin: 0 15px;
        text-decoration: none;
        color: #007bff;
      }

      nav a:hover {
        text-decoration: underline;
      }
    `
  ]
})
export class AppComponent {}
