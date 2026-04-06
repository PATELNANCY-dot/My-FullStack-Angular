import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';
import { UserService, User } from '../Service/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router
  ) { }

  registerUser() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.http.get<any>(`https://localhost:7107/Treasure/InsertClient?FullName=${encodeURIComponent(this.fullName)}&Email=${encodeURIComponent(this.email)}&passwords=${encodeURIComponent(this.password)}`)
      .subscribe({
        next: (data) => {
          alert(data.message);
          if (data.message === 'Registration Successful') {
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.error(err);
          alert('Registration failed!');
        }
      });
  }
}
