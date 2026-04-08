import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  ClientID: number;
  fullName: string;
  email: string;
  isLoggedIn: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _user$ = new BehaviorSubject<User | null>(this.getUserFromSession());

  // Observable to subscribe to user changes
  user$ = this._user$.asObservable();

  constructor() { }

  // Set logged-in user
  setUser(user: User) {
    this._user$.next(user);
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  // Get current user (latest value)
  getUser(): User | null {
    return this._user$.value;
  }

  // Clear user info
  clearUser() {
    this._user$.next(null);
    sessionStorage.removeItem('user');
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return !!this._user$.value?.isLoggedIn;
  }

  // Restore user from session storage
  private getUserFromSession(): User | null {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }
}
