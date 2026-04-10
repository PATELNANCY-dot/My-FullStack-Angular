import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService, User } from '../Service/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'

declare var Swal: any;

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
          this.showAlert('success', 'Login Successful', 'Welcome back!');
          this.router.navigate(['/home']);

        } else {
          this.showAlert('error', 'Login Failed', 'Invalid email or password')

        }
      },
      error: (err) => {
        console.error('HTTP error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Something went wrong',
          customClass: {
            popup: 'my-swal-popup',
            title: 'my-swal-title',
            confirmButton: 'my-swal-button'
          }
        });
      }
    });
  }

  showAlert(icon: string, title: string, text: string) {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      customClass: {
        popup: 'my-swal-popup',
        title: 'my-swal-title',
        confirmButton: 'my-swal-button'
      }
    });
  }
}
