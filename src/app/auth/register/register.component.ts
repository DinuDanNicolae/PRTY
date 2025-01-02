import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NzFormModule, NzInputModule, NzButtonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}

  register() {
    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Update the display name in Firebase Authentication
        updateProfile(user, { displayName: this.username }).then(() => {
          // Create a user document in the Firestore `users` collection
          this.createUserDocument(user.uid);

          // Navigate to the profile page
          alert('Registration successful!');
          this.router.navigate(['/profile']);
        });
      })
      .catch((error) => {
        console.error('Error registering user:', error.message);
        alert('Registration failed: ' + error.message);
      });
  }

  private createUserDocument(uid: string) {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    setDoc(userDocRef, {
      username: this.username,
      email: this.email,
      friends: [], // Initialize an empty friends array
    })
      .then(() => {
        console.log('User document created successfully in Firestore.');
      })
      .catch((error) => {
        console.error('Error creating user document:', error.message);
      });
  }
}
