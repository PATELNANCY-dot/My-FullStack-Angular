import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService, User } from '../Service/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email = '';
  password = '';
  hidePassword = true;
  constructor(private http: HttpClient, private userService: UserService, private router: Router) { }

  loginUser() {
    const payload = { Email: this.email, passwords: this.password };

    this.http.get<any>(
      `https://localhost:7107/api/Treasure/LoginClient?Email=${encodeURIComponent(this.email)}&passwords=${encodeURIComponent(this.password)}`
    ).subscribe({
      next: (data) => {
        if (data.success) {
          this.userService.setUser({
            ClientID: data.clientID,
            fullName: data.fullName,
            email: data.email,
            isLoggedIn: true
          });
          alert('Login successful!');
          this.router.navigate(['/home'])
        } else {
          alert('Invalid email or password!');
        }
      },
      error: (err) => {
        console.error('HTTP error:', err);
        alert('Login failed');
      }
    });
  }
}
