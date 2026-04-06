// src/Service/user.service.ts
import { Injectable } from '@angular/core';

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

  private user: User | null = null;

  constructor() {
    // Restore user after refresh
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  // Set logged-in user
  setUser(user: User) {
    this.user = user;
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  // Get user info
  getUser(): User | null {
    if (!this.user) {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    }
    return this.user;
  }

  // Clear user info
  clearUser() {
    this.user = null;
    sessionStorage.removeItem('user');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const user = this.getUser();
    return user !== null && user.isLoggedIn;
  }
}
