import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {

  name = '';
  email = '';
  message = '';

  constructor(private http: HttpClient) { }

  submitForm(form: NgForm) {

    if (!this.name || !this.email || !this.message) {
      alert("Please fill all fields!");
      return;
    }

    const url =
      `https://localhost:7107/api/Treasure/Contect?FullName=${encodeURIComponent(this.name)}&Email=${encodeURIComponent(this.email)}&messagees=${encodeURIComponent(this.message)}`;

    this.http.get<any>(url).subscribe({
      next: (data) => {
        alert(data.message);

        // clear all inputs
        form.reset();
      },
      error: (err) => {
        console.error(err);
        alert("Error sending message. Please try again.");
      }
    });
  }
}
