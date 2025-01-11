import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private firestore: Firestore) {}

  /**
   * Create a doc in subcollection "checkins" with ID = userId
   * if it doesn’t exist yet.
   */
  async checkIn(eventId: string, userId: string): Promise<void> {
    const checkInDocRef = doc(this.firestore, `events/${eventId}/checkins/${userId}`);
    
    // Check if user is already checked in
    const snap = await getDoc(checkInDocRef);
    if (!snap.exists()) {
      // If not already checked in, create the doc
      await setDoc(checkInDocRef, {
        userId,
        checkedInAt: serverTimestamp(),
      });
    }
  }

  async addCheckinToUserDoc(
    userId: string,
    location: string,
    title: string,
  ): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    
    // Create an object with whatever fields you need
    const newCheckin = {
      title: title,
    };

    await updateDoc(userDocRef, {
      checkins: arrayUnion(newCheckin),
    });
  }

  /**
   * Returns true if /events/{eventId}/checkins/{userId} document exists.
   */
  async isUserCheckedIn(eventId: string, userId: string): Promise<boolean> {
    const checkInDocRef = doc(this.firestore, `events/${eventId}/checkins/${userId}`);
    const snap = await getDoc(checkInDocRef);
    return snap.exists();
  }

  async getCheckinCount(eventDocId: string): Promise<number> {
    const checkinsRef = collection(this.firestore, `events/${eventDocId}/checkins`);
    const snapshot = await getDocs(checkinsRef);
    console.log("Number of check ins: ", snapshot.size);
    return snapshot.size; // number of user check-ins
  }

  async updateUserLocation(userId: string, location: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    await updateDoc(userDocRef, {
      currentLocation: location,
    });
  }

  async getEventIdFromCheckIn(checkIn: { title: string; location: string }): Promise<string | null> {
    const eventsCollectionRef = collection(this.firestore, 'events'); // Reference to the 'events' collection
    const eventsSnapshot = await getDocs(eventsCollectionRef);
  
    for (const doc of eventsSnapshot.docs) {
      const eventData = doc.data() as any; // Cast to 'any' or your event interface
      if (eventData.Titlu === checkIn.title && eventData.Adresa === checkIn.location) {
        return doc.id; // Return the document ID (event ID) of the matching event
      }
    }
  
    // If no match is found, return null
    return null;
  }

  async removeCheckIn(
    userId: string,
    eventId: string,
    checkinToRemove: { title: string; location: string }
  ): Promise<void> {
    // Remove the check-in document from the event's subcollection
    const checkInDocRef = doc(this.firestore, `events/${eventId}/checkins/${userId}`);
    await deleteDoc(checkInDocRef); // This deletes the document completely
  
    // Remove the check-in entry from the user's document
    const userDocRef = doc(this.firestore, `users/${userId}`);
    await updateDoc(userDocRef, {
      checkins: arrayRemove(checkinToRemove),
    });
  }
}
