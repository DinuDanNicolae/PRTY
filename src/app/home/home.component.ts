import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home-container">
      <h1>Welcome to the Home Page</h1>
    </div>
  `,
  styles: [
    `
      .home-container {
        text-align: center;
        margin-top: 50px;
      }

      h1 {
        color: #007bff;
      }
    `
  ]
})
export class HomeComponent {}
