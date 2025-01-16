import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule], 
  template: `
    <div >
      
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
export class HomeComponent {
}
