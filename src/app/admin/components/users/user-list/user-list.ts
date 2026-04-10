import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {

  users: any[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.http.get<any[]>('https://localhost:7107/api/Admin/GetAllUsers')
      .subscribe({
        next: (res) => {
          console.log('Users loaded:', res);
          this.users = res;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('API Error:', err);
          this.cdr.detectChanges();
        }
      });
  }
}
