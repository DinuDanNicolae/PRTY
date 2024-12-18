import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './welcome.component.html', // Referință la template-ul HTML
  styleUrls: ['./welcome.component.scss'] // Referință la fișierul de stiluri CSS
})
export class WelcomeComponent {}
