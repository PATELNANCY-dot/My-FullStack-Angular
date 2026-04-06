import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../Service/user';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';

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

  sortOrders = (a: any, b: any): number => {
    return Number(b.key) - Number(a.key);
  };
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {

    const user = this.userService.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    this.clientId = user.ClientID;

    this.loadOrders();
  }

  loadOrders() {

    this.http.get(`https://localhost:7107/Treasure/OrderHistory?ClientID=${this.clientId}`)
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

    if (!confirm("Clear all history?")) return;

    this.http.post(`https://localhost:7107/Treasure/ClearHistory?ClientID=${this.clientId}`, {})
      .subscribe((res: any) => {

        alert(res.message);
        this.loadOrders();

      });

  }
  deleteOrder(orderId: any) {

    const id = Number(orderId);

    if (!confirm("Delete this order?")) return;

    this.http.post(`https://localhost:7107/Treasure/DeleteOrder?OrderId=${id}`, {})
      .subscribe((res: any) => {

        alert(res.message);
        this.loadOrders();

      });

  }

}
