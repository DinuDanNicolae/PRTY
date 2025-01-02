import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './auth/login/login.component';

import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './auth/auth.guard'; // Import the Auth Guard
import { FriendsComponent } from './friends/friends.component'; 
import { MapComponent } from './map/map.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }, // Protect profile
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] }, // Protect map
  { path: 'friends', component: FriendsComponent, canActivate: [AuthGuard] },
];