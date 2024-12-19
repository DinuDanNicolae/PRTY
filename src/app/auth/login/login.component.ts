import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private auth: Auth, private router: Router) {}

  login() {
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(() => {
        alert('Login successful!');
        localStorage.setItem('authToken', 'example-token');
        this.router.navigate(['/profile']);
      })
      .catch((error) => {
        console.error('Error logging in:', error.message);
        alert('Login failed: ' + error.message);
      });
  }
}
