import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../Service/user';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var Swal: any; // for SweetAlert2 CDN

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class History implements OnInit {

  clientId: number = 0;
  orders: any[] = [];
  groupedOrders: any = {};

  sortOrders = (a: any, b: any): number => Number(b.key) - Number(a.key);

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const user = this.userService.getUser();

    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login first!',
        customClass: {
          popup: 'my-swal-popup',
          title: 'my-swal-title',
          confirmButton: 'my-swal-button'
        }
      });
      return;
    }

    this.clientId = user.ClientID;
    this.loadOrders();
  }

  loadOrders() {
    this.http.get(`https://localhost:7107/api/Treasure/OrderHistory?ClientID=${this.clientId}`)
      .subscribe((data: any) => {
        this.orders = data;
        this.groupOrders();
        this.cdr.detectChanges();
      });
  }

  groupOrders() {
    this.groupedOrders = {};

    this.orders.forEach(item => {
      if (!this.groupedOrders[item.orderId]) {
        this.groupedOrders[item.orderId] = {
          date: item.orderDate,
          status: item.status,
          items: []
        };
      }
      this.groupedOrders[item.orderId].items.push(item);
    });
  }

  clearHistory() {
    Swal.fire({
      icon: 'warning',
      title: 'Confirm',
      text: 'Clear all history?',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'my-swal-popup',
        title: 'my-swal-title',
        confirmButton: 'my-swal-button',
        cancelButton: 'my-swal-button'
      }
    }).then((result: any) => { // use 'any' for CDN
      if (result.isConfirmed) {
        this.http.post(`https://localhost:7107/api/Treasure/ClearHistory?ClientID=${this.clientId}`, {})
          .subscribe((res: any) => {
            Swal.fire({
              icon: res.success ? 'success' : 'error',
              title: 'History',
              text: res.message,
              customClass: {
                popup: 'my-swal-popup',
                title: 'my-swal-title',
                confirmButton: 'my-swal-button'
              }
            });
            this.loadOrders();
          });
      }
    });
  }

  deleteOrder(orderId: any) {
    const id = Number(orderId);

    Swal.fire({
      icon: 'warning',
      title: 'Confirm',
      text: 'Delete this order?',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'my-swal-popup',
        title: 'my-swal-title',
        confirmButton: 'my-swal-button',
        cancelButton: 'my-swal-button'
      }
    }).then((result: any) => { // use 'any' for CDN
      if (result.isConfirmed) {
        this.http.post(`https://localhost:7107/api/Treasure/DeleteOrder?OrderId=${id}`, {})
          .subscribe((res: any) => {
            Swal.fire({
              icon: res.success ? 'success' : 'error',
              title: 'Order',
              text: res.message,
              customClass: {
                popup: 'my-swal-popup',
                title: 'my-swal-title',
                confirmButton: 'my-swal-button'
              }
            });
            this.loadOrders();
          });
      }
    });
  }
}
