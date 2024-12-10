import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="welcome-container">
      <h1>Welcome</h1>
      <p>Please choose an option:</p>
      <button routerLink="/login">Login</button>
      <button routerLink="/register">Register</button>
    </div>
  `,
  styles: [
    `
      .welcome-container {
        text-align: center;
        margin-top: 50px;
      }
      button {
        margin: 10px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
      }
    `
  ]
})
export class WelcomeComponent {}
