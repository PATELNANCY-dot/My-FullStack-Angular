import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';

declare var Swal: any;

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

      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill all fields!',
        customClass: {
          popup: 'my-swal-popup',
          title: 'my-swal-title',
          confirmButton: 'my-swal-button'
        }
      });

      return;
    }

    const url =
      `https://localhost:7107/api/Treasure/Contect?FullName=${encodeURIComponent(this.name)}&Email=${encodeURIComponent(this.email)}&messagees=${encodeURIComponent(this.message)}`;

    this.http.get<any>(url).subscribe({
      next: (data) => {

        Swal.fire({
          icon: 'success',
          title: 'Message Sent',
          text: data.message,
          customClass: {
            popup: 'my-swal-popup',
            title: 'my-swal-title',
            confirmButton: 'my-swal-button'
          }
        });

        form.reset();
      },

      error: (err) => {
        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error sending message. Please try again.',
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
