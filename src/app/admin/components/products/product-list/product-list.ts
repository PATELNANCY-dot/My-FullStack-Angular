import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {

  products: any[] = [];

  searchText: string = '';

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProducts();

  }

  loadProducts() {
    const api = "https://localhost:7107/api/Treasure/GetProducts";

    this.http.get<any[]>(api).subscribe(data => {
      console.log("Products:", data);

      this.products = data;
      this.cd.detectChanges();
      const productIds = data.map(item => item.productid);
      console.log("Product IDs:", productIds);
    });
  }

  edit(productid: number) {
    // Navigate to next page with productid in URL
    this.router.navigate(['/admin/product-edit', productid]);
  }






  deleteProduct(id: number) {

    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const api = `https://localhost:7107/api/Admin/DeleteProduct/${id}`;

    this.http.delete(api).subscribe(() => {

      alert("Product deleted successfully");

      // refresh list
      this.loadProducts();

    });
  }



  searchProduct() {

    if (this.searchText.trim() === '') {
      this.loadProducts();
      return;
    }

    const api = `https://localhost:7107/api/Treasure/SearchProduct?name=${this.searchText}`;

    this.http.get<any[]>(api).subscribe(data => {

      console.log("Search result:", data);

      this.products = data;
      this.cd.detectChanges();

    });
  }




}
