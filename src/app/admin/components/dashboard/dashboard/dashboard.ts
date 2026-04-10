import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  productsCount = 0;
  ordersCount = 0;
  usersCount = 0;

  products: any[] = [];
  orders: any[] = [];

  // 👉 popup controls
  showPopup = false;
  popupTitle = '';
  selectedProducts: any[] = [];
  topProductsChart: any;

  stockLabels: string[] = ['In Stock', 'Low Stock', 'Out of Stock'];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadCounts();
  }

  // ================= COUNTS =================
  loadCounts() {

    this.http.get<any[]>('https://localhost:7107/api/Treasure/GetProducts')
      .subscribe(res => {
        this.productsCount = res.length;
        this.products = res;

        this.cdr.detectChanges();
        setTimeout(() => {
          this.buildStockChart();
        });
      });

    this.http.get<any[]>('https://localhost:7107/api/Admin/GetOrdersWithItems')
      .subscribe(res => {
        this.ordersCount = res.length;
        this.orders = res;



        setTimeout(() => {
          this.buildOrdersChart();
          this.buildTopProductsChart(); // ADD THIS
        });
        this.cdr.detectChanges();
      });

    this.http.get<any[]>('https://localhost:7107/api/Admin/GetAllUsers')
      .subscribe(res => {
        this.usersCount = res.length;
        this.cdr.detectChanges();
      });
  }

  // ================= ORDERS LINE CHART =================
  buildOrdersChart() {

    const map = new Map<string, number>();

    this.orders.forEach((o: any) => {
      const date = new Date(o.orderDate).toLocaleDateString();
      map.set(date, (map.get(date) || 0) + 1);
    });

    new Chart('ordersChart', {
      type: 'line',
      data: {
        labels: Array.from(map.keys()),
        datasets: [{
          label: 'Orders',
          data: Array.from(map.values()),
          fill: true,
          tension: 0.4,
          borderColor: '#0d6efd'
        }]
      }
    });
  }

  // ================= STOCK PIE CHART (CLICK ENABLED) =================
  buildStockChart() {

    let inStock = 0;
    let lowStock = 0;
    let outStock = 0;

    this.products.forEach((p: any) => {
      if (p.productquentity === 0) outStock++;
      else if (p.productquentity < 5) lowStock++;
      else inStock++;
    });

    new Chart('stockChart', {
      type: 'pie',
      data: {
        labels: this.stockLabels,
        datasets: [{
          data: [inStock, lowStock, outStock],
          backgroundColor: [
            '#36A2EB', // Blue → In Stock
            '#FFCE56', // Yellow/Orange → Low Stock
            '#FF6384'  // Red/Pink → Out Of Stock
          ]
        }]
      },
      options: {
        onClick: (event: any, elements: any[]) => {

          if (!elements.length) return;

          const index = elements[0].index;
          const label = this.stockLabels[index];

          setTimeout(() => {
            this.showStockPopup(label);
          });

        }
      }
    });
  }

  // ================= POPUP LOGIC =================
  showStockPopup(type: string) {

    if (type === 'Out of Stock') {
      this.selectedProducts = this.products.filter(p => p.productquentity === 0);
      this.popupTitle = 'Out of Stock Products';
    }
    else if (type === 'Low Stock') {
      this.selectedProducts = this.products.filter(p => p.productquentity > 0 && p.productquentity < 5);
      this.popupTitle = 'Low Stock Products';
    }
    else {
      this.selectedProducts = this.products.filter(p => p.productquentity >= 5);
      this.popupTitle = 'In Stock Products';
    }

    this.showPopup = true;
    this.cdr.detectChanges();
  }

  closePopup() {
    this.showPopup = false;
  }


  buildTopProductsChart() {

    this.http.get<any[]>('https://localhost:7107/api/Admin/GetTopSellingProducts')
      .subscribe(res => {

        const labels = res.map(x => x.productName);
        const data = res.map(x => x.totalSold);

        if (this.topProductsChart) {
          this.topProductsChart.destroy();
        }

        this.topProductsChart = new Chart('topProductsChart', {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Units Sold',
              data: data
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true
          }
        });

        this.cdr.detectChanges();
      });
  }
}
