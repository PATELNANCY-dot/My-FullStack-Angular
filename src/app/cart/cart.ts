import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { UserService } from '../Service/user';
import { Router } from '@angular/router';
import { CartService } from '../Service/cart.service';
import GLightbox from 'glightbox';
import { Modal } from 'bootstrap';
import { FormsModule } from '@angular/forms';

declare var Swal: any;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {

  cart: any[] = [];
  totalPrice: number = 0;
  user: any;
  selectedProduct: any = null;
  lightbox: any;


  customerName = '';
  customerEmail = '';
  customerAddress = '';
  paymentMethod = '';


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
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login first!',
        customClass: {
          popup: 'my-swal-popup',
          title: 'my-swal-title',
          confirmButton: 'my-swal-button'
        }
      }).then(() => window.location.href = "/login");
      return;
    }

    this.loadCart();
  }

  loadCart() {
    this.http.get<any>(`https://localhost:7107/api/Treasure/Cart?ClientID=${this.user.ClientID}`)
      .subscribe(data => {
        this.cart = data.map((item: any) => ({
          cartid: item.cartid,
          productid: item.productid,
          title: item.productname,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          imgSrc: item.productimage,
          productquentity: item.productquentity,
          productdescription: item.productdescription,
        }));
        this.calculateTotal();
        this.updateCartCount();
        this.cdr.detectChanges();
      });
  }

  calculateTotal() {
    this.totalPrice = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  updateCartQuantity(cartid: number, change: number) {
    const item = this.cart.find(c => c.cartid === cartid);
    if (!item) return;

    const newQty = item.quantity + change;

    if (newQty === 0) {
      this.removeCartItem(cartid);

      const modalEl = document.getElementById('productModal');
      if (modalEl) {
        const modal = Modal.getInstance(modalEl);
        modal?.hide();
      }

      return;
    }

    this.http.get<any>(`https://localhost:7107/api/Treasure/UpdateCartQuantity?Cartid=${cartid}&Quantity=${newQty}`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            item.quantity = newQty;
            this.calculateTotal();
            this.updateCartCount();
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update quantity!',
            customClass: {
              popup: 'my-swal-popup',
              title: 'my-swal-title',
              confirmButton: 'my-swal-button'
            }
          });
        }
      });
  }

  removeCartItem(cartid: number) {
    this.cart = this.cart.filter(item => item.cartid !== cartid);
    this.calculateTotal();
    this.updateCartCount();

    this.http.get<any>(`https://localhost:7107/api/Treasure/RemoveItem?Cartid=${cartid}`)
      .subscribe(res => {
        if (!res.success) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message,
            customClass: {
              popup: 'my-swal-popup',
              title: 'my-swal-title',
              confirmButton: 'my-swal-button'
            }
          });
          this.loadCart();
        }
      });
  }

  buyNow() {

    if (this.cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cart Empty',
        text: 'Your cart is empty'
      });
      return;
    }

    // auto fill user info
    this.customerName = this.user?.ClientName || '';
    this.customerEmail = this.user?.Email || '';

    const modalEl = document.getElementById('checkoutModal');

    if (modalEl) {
      const modal = new Modal(modalEl);
      this.cdr.detectChanges();
      modal.show();
    }


  }

  confirmOrder() {

    if (
      !this.customerName?.trim() ||
      !this.customerEmail?.trim() ||
      !this.customerAddress?.trim() ||
      !this.paymentMethod
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Details',
        text: 'Please fill all fields'
      });
      return;
    }

    this.http.post<any>(
      `https://localhost:7107/api/Treasure/PlaceOrder`,
      {
        ClientID: this.user.ClientID,
        CustomerName: this.customerName,
        CustomerEmail: this.customerEmail,
        CustomerAddress: this.customerAddress,
        PaymentMethod: this.paymentMethod
      }
    ).subscribe({

      next: (res) => {

        if (res.success) {

          /* ✅ CLOSE CHECKOUT MODAL FIRST */
          const modalEl = document.getElementById('checkoutModal');
          if (modalEl) {
            const modal = Modal.getInstance(modalEl);
            modal?.hide();
          }

          Swal.fire({
            icon: 'success',
            title: 'Order Placed',
            text: res.message
          }).then(() => {

            this.cart = [];
            this.totalPrice = 0;
            this.updateCartCount();

            this.router.navigate(['/history']);

          });

        }

      },

      error: (err) => {
        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Order Failed',
          text: 'Failed to place order.'
        });

      }

    });

  }

  updateCartCount() {
    const count = this.cart.reduce((total, item) => total + Number(item.quantity), 0);
    this.cartService.setCartCount(count);
  }

  openModal(product: any) {
    this.selectedProduct = product;

    const modalEl = document.getElementById('productModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }

    setTimeout(() => {
      if (this.lightbox) this.lightbox.destroy();
      this.lightbox = GLightbox({ selector: '.glightbox' });
    }, 200);
  }

  trackByCart(index: number, item: any) {
    return item.cartid;
  }
}
