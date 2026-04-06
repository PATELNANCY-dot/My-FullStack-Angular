import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { UserService } from '../Service/user';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../app.routes';
import { CartService } from '../Service/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {

  cart: any[] = [];
  totalPrice: number = 0;
  user: any;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit() {

    this.user = this.userService.getUser();

    if (!this.user || !this.user.isLoggedIn) {
      alert("Please login first!");
      window.location.href = "/login";
      return;
    }

    this.loadCart();
  }

  // LOAD CART
  loadCart() {

    this.http.get<any>(`https://localhost:7107/Treasure/Cart?ClientID=${this.user.ClientID}`)
      .subscribe(data => {

        this.cart = data.map((item: any) => ({
          cartid: item.cartid,
          productid: item.productid,
          title: item.productname,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          imgSrc: item.productimage
        }));
        this.calculateTotal();
        this.updateCartCount();
        this.cdr.detectChanges();

      });
  }

  // CALCULATE TOTAL
  calculateTotal() {

    this.totalPrice = this.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

  }

  // UPDATE QUANTITY
  updateCartQuantity(cartid: number, change: number) {
    const item = this.cart.find(c => c.cartid === cartid);
    if (!item) return;

    const newQty = item.quantity + change;
    if (newQty < 1) return;

    // Call backend first
    this.http.get<any>(
      `https://localhost:7107/Treasure/UpdateCartQuantity?Cartid=${cartid}&Quantity=${newQty}`
    ).subscribe({
      next: (res) => {
        if (res.success) {
          item.quantity = newQty;
          this.calculateTotal();
          this.updateCartCount();
          this.cdr.detectChanges();
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        console.error("Backend update failed", err);
        alert("Failed to update quantity.");
      }
    });
  }

  // REMOVE ITEM
  removeCartItem(cartid: number) {

    // Remove instantly from UI
    this.cart = this.cart.filter(item => item.cartid !== cartid);
    this.calculateTotal();
    this.updateCartCount();

    // Remove from database
    this.http.get<any>(
      `https://localhost:7107/Treasure/RemoveItem?Cartid=${cartid}`
    ).subscribe(res => {

      if (!res.success) {
        alert(res.message);
        this.loadCart();
      }

    });

  }

  // BUY NOW
  buyNow() {

    if (this.cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    this.http.post<any>(
      `https://localhost:7107/Treasure/PlaceOrder?ClientID=${this.user.ClientID}`, {}
    ).subscribe(res => {

      if (res.success) {

        alert("Order placed successfully!");
        this.cart = [];
        this.totalPrice = 0;
        this.updateCartCount();
        this.router.navigate(['./history'])

      } else {
        alert(res.message);
      }

    });

  }

  updateCartCount() {

    const count = this.cart.reduce(
      (total, item) => total + Number(item.quantity),
      0
    );

    this.cartService.setCartCount(count);

  }
}
