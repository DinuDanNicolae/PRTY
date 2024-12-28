import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule, NzButtonModule],
  templateUrl: './welcome.component.html', 
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {}
