import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { EventService } from '../map/services/event.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  checkIns: { title: string; location: string }[] = [];
  showCheckIns = false;

  constructor(private auth: Auth, private router: Router, private firestore: Firestore, private eventService: EventService) {}

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      this.user = user;
    });
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        alert('Logged out successfully!');
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Error logging out:', error.message);
        alert('Logout failed: ' + error.message);
      });
  }

  async loadCheckIns() {
    if (!this.user) {
      console.error('No authenticated user found!');
      return;
    }

    const userDocRef = doc(this.firestore, `users/${this.user.uid}`);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error('User document does not exist!');
      return;
    }

    const userData = userDoc.data() as any;
    this.checkIns = userData.checkins || []; // Retrieve check-ins array
    this.showCheckIns = true; // Display check-ins
  }

  async onRemoveCheckIn(checkIn: { title: string; location: string }) {
    if (!this.user) {
      console.error('User not authenticated!');
      return;
    }
  
    try {
      const eventId = await this.eventService.getEventIdFromCheckIn(checkIn);
      if (!eventId) {
        console.error('Event ID not found for this check-in:', checkIn);
        alert('Event not found. Unable to remove check-in.');
        return;
      }
  
      await this.eventService.removeCheckIn(this.user.uid, eventId, checkIn);
  
      // Update the local check-ins list
      this.checkIns = this.checkIns.filter(
        (ci) => ci.title !== checkIn.title || ci.location !== checkIn.location
      );
  
      alert('Check-in removed successfully!');
    } catch (error) {
      console.error('Error removing check-in:', error);
      alert('Failed to remove check-in. Please try again.');
    }
  }

  closeCheckIns() {
    this.showCheckIns = false;
  }
}
