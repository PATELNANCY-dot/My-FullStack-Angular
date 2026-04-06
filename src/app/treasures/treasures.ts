import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../Service/user';
import { CartService } from '../Service/cart.service';


@Component({
  selector: 'app-treasures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './treasures.html',
  styleUrls: ['./treasures.css'],
  encapsulation: ViewEncapsulation.None
})
export class Treasures implements OnInit {

  products: any[] = [];
  expandedProduct: number | null = null;
  searchText = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  // GET all products
  loadProducts() {
    this.http.get<any>("https://localhost:7107/Treasure/GetProducts")
      .subscribe(data => {
        console.log(data);
        this.products = data;
        this.cdr.detectChanges();
      });
  }

  // ADD TO CART using GET
  addToCart(product: any) {

    const user = this.userService.getUser();

    if (!user || !user.isLoggedIn) {
      alert("Please login first!");
      window.location.href = "/login";
      return;
    }

    const body = {
      ClientID: user.ClientID,
      Productid: product.productid,
      Productimage: product.productimage,
      Quantity: 1,
      Price: product.price
    };

    this.http.post<any>("https://localhost:7107/Treasure/AddToCart", body)
      .subscribe({
        next: (data) => {

          alert(data.message);

          //  update navbar cart badge instantly
          if (data.totalQuantity !== undefined) {
            this.cartService.setCartCount(data.totalQuantity);
          }

        },
        error: (err) => {
          console.error(err);
          alert("Error adding to cart");
        }
      });

  }
  // SEARCH
  searchItems() {

    if (this.searchText.trim() === '') {
      this.loadProducts();
      return;
    }

    const url = `https://localhost:7107/Treasure/SearchProduct?name=${this.searchText}`;

    this.http.get<any>(url)
      .subscribe(data => {
        this.products = data;
      });
  }


  toggleDescription(id: number) {

    if (this.expandedProduct === id) {
      this.expandedProduct = null;
    } else {
      this.expandedProduct = id;
    }

  }


}
