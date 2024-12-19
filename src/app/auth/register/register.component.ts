import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private auth: Auth, private router: Router) {}

  register() {
    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, { displayName: this.username }).then(() => {
          alert('Registration successful! Please login.');
          this.router.navigate(['/login']); // Redirect to login page
        });
      })
      .catch((error) => {
        console.error('Error registering user:', error.message);
        alert('Registration failed: ' + error.message);
      });
  }
}
