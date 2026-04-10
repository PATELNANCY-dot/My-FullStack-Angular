import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderList {

  selectedOrder: any = null;
  showModal: boolean = false;

  orders: any[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('OrderList component loaded');
    this.getOrders();
  }


  getOrders() {
    this.http.get<any[]>('https://localhost:7107/api/Admin/GetOrdersWithItems')
      .subscribe({
        next: (res) => {

          // Sort latest orders first
          this.orders = res.sort((a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );

          console.log('Orders Loaded:', this.orders);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Orders API Error:', err);
        }
      });
  }

  openOrder(order: any) {

    const orderId = order.orderId || order.OrderId;

    this.http.get<any[]>(
      `https://localhost:7107/api/Admin/GetOrderItemsWithProductDetails/${orderId}`
    ).subscribe({
      next: (res) => {

        console.log('Order Items API Result:', res);
        console.log('Clicked Order:', order);

        this.selectedOrder = {
          ...order,
          items: res   // ✅ now contains productName + productImage
        };

        this.showModal = true;
      },
      error: (err) => {
        console.log('Order Items API Error:', err);
      }
    });
  }

  // ✅ CLOSE MODAL
  closeModal() {
    this.showModal = false;
    this.selectedOrder = null;
  }
}
