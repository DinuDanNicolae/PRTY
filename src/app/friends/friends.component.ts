import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
})
export class FriendsComponent implements OnInit {
  friends: any[] = []; // Array to store friends' data
  newFriendUsername: string = '';

  constructor(private firestore: Firestore, private auth: Auth) {}

  async ngOnInit() {
    this.loadFriends(); // Load friends when the component initializes
  }

  async loadFriends() {
    const currentUserUid = this.auth.currentUser?.uid;
    if (!currentUserUid) {
      console.error('User is not authenticated!');
      return;
    }
  
    try {
      const userDocRef = doc(this.firestore, `users/${currentUserUid}`);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        console.error('User document does not exist!');
        return;
      }
  
      const userData = userDoc.data() as any;
      const friendUids = userData.friends || [];
  
      this.friends = []; // Clear the friends array before reloading
  
      for (const friendUid of friendUids) {
        const friendDocRef = doc(this.firestore, `users/${friendUid}`);
        const friendDoc = await getDoc(friendDocRef);
  
        if (friendDoc.exists()) {
          this.friends.push({
            uid: friendUid,
            ...friendDoc.data(),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  }
  

  toggleCheckins(friend: any) {
    friend.showCheckins = !friend.showCheckins;
  }

  async addFriend() {
    const usersCollection = collection(this.firestore, 'users');
    const querySnapshot = await getDocs(usersCollection);
  
    let foundFriendId: string | null = null;
  
    // Find the friend's UID by their username
    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data() as any;
      if (userData.username === this.newFriendUsername) {
        foundFriendId = userDoc.id;
      }
    });
  
    if (!foundFriendId) {
      alert('User not found');
      return;
    }
  
    const currentUserUid = this.auth.currentUser?.uid;
    if (!currentUserUid) {
      console.error('User is not authenticated!');
      return;
    }
  
    // Fetch the current user's document
    const userRef = doc(this.firestore, `users/${currentUserUid}`);
    const userDoc = await getDoc(userRef);
  
    if (!userDoc.exists()) {
      console.error('User document does not exist!');
      return;
    }
  
    const userData = userDoc.data() as any;
  
    // Check if the friend is already in the user's friend list
    if (userData.friends && userData.friends.includes(foundFriendId)) {
      alert('This user is already your friend.');
      return;
    }
  
    // Fetch the friend's document
    const friendRef = doc(this.firestore, `users/${foundFriendId}`);
  
    // Update both users' friend lists
    await updateDoc(userRef, { friends: arrayUnion(foundFriendId) });
    await updateDoc(friendRef, { friends: arrayUnion(currentUserUid) });
  
    alert('Friend added successfully!');
    this.newFriendUsername = '';
    this.loadFriends(); 
  }
  
  async removeFriend(friendUid: string) {
    console.log(friendUid);
    const currentUserUid = this.auth.currentUser?.uid;
    if (!currentUserUid) {
      console.error('User is not authenticated!');
      return;
    }
  
    try {
      const userRef = doc(this.firestore, `users/${currentUserUid}`);
      const friendRef = doc(this.firestore, `users/${friendUid}`);

      await updateDoc(userRef, {
        friends: arrayRemove(friendUid),
      });
  
      await updateDoc(friendRef, {
        friends: arrayRemove(currentUserUid),
      });
  
      this.friends = this.friends.filter((friend) => friend.uid !== friendUid);
  
      alert('Friend removed successfully!');
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend. Please try again.');
    }
  }

}