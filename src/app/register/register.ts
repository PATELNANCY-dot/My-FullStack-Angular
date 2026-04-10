import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../Service/user';
import { CommonModule } from '@angular/common';

declare var Swal: any; // For SweetAlert2 CDN

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router
  ) { }

  registerUser() {
    if (this.password !== this.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Mismatch',
        text: 'Passwords do not match!',
        customClass: {
          popup: 'my-swal-popup',
          title: 'my-swal-title',
          confirmButton: 'my-swal-button'
        }
      });
      return;
    }

    const url = `https://localhost:7107/api/Treasure/InsertClient?FullName=${encodeURIComponent(this.fullName)}&Email=${encodeURIComponent(this.email)}&passwords=${encodeURIComponent(this.password)}`;

    this.http.get<any>(url)
      .subscribe({
        next: (data) => {
          Swal.fire({
            icon: data.message === 'Registration Successful' ? 'success' : 'error',
            title: 'Registration',
            text: data.message,
            customClass: {
              popup: 'my-swal-popup',
              title: 'my-swal-title',
              confirmButton: 'my-swal-button'
            }
          }).then(() => {
            if (data.message === 'Registration Successful') {
              this.router.navigate(['/login']);
            }
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Registration failed!',
            customClass: {
              popup: 'my-swal-popup',
              title: 'my-swal-title',
              confirmButton: 'my-swal-button'
            }
          });
        }
      });
  }
}
