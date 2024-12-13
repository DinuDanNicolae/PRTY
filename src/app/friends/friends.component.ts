import { Component } from '@angular/core';

@Component({
  selector: 'app-friends',
  standalone: true,
  template: `
    <div>
      <h1>Friends Page</h1>
      <p>Welcome to the friends page. This is accessible only to logged-in users.</p>
    </div>
  `,
  styles: [
    `
      div {
        text-align: center;
        margin-top: 50px;
      }
    `,
  ],
})
export class FriendsComponent {}
