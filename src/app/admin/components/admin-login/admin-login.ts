import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
  standalone: true,
  imports: [CommonModule, FormsModule] 
})
export class AdminLogin {

  email = '';
  password = '';

  constructor(private router: Router, private http: HttpClient) { }

  login() {

    const apiUrl =
      `https://localhost:7107/api/Admin/Login?Email=${this.email}&Password=${this.password}`;

    this.http.get(apiUrl).subscribe((res: any) => {

      if (res.success) {

        sessionStorage.setItem("adminLoggedIn", "true");

        this.router.navigate(['/admin/dashboard']);

      }
      else {
        alert("Invalid admin login");
      }

    });

  }

}
