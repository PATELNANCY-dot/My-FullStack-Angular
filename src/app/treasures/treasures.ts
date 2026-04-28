import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import GLightbox from 'glightbox';
import { UserService } from '../Service/user';
import { CartService } from '../Service/cart.service';
import { WishlistService } from '../Service/wishlist.service';

declare var Swal: any;

// Define Product interface
interface Product {
  productid: number;
  productname: string;
  productdescription: string;
  productimage: string;
  price: number;
  productquentity: number; // always defined
  quantityInCart: number;  // always defined, not optional
  cartid?: number;
  isInWishlist?: boolean;
}

@Component({
  selector: 'app-treasures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './treasures.html',
  styleUrls: ['./treasures.css'],
  encapsulation: ViewEncapsulation.None
})
export class Treasures implements OnInit {

  products: Product[] = [];
  expandedProduct: number | null = null;
  selectedProduct: Product | null = null;
  searchText = '';
  clientId!: number;
  user: any;
  lightbox: any;

  currentPage = 1;
  itemsPerPage = 8;



  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.products.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.products.length / this.itemsPerPage);
  }

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private cartService: CartService,
    private wishlistService: WishlistService
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

    this.clientId = this.user.ClientID;
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>("https://localhost:7107/api/Treasure/GetProducts")
      .subscribe(products => {

        // SORT: newest product first
        products.sort((a, b) => b.productid - a.productid);

        this.products = products.map(p => ({
          ...p,
          quantityInCart: 0,
          isInWishlist: false
        }));

        this.loadUserCart();
        this.loadWishlist();
      });
  }
  loadWishlist() {
    this.wishlistService.getWishlist(this.clientId).subscribe(res => {
      if (res.success && res.wishlist) {
        const wishlistSet = new Set<number>();
        (res.wishlist as any[]).forEach(item => wishlistSet.add(item.productID));
        this.products.forEach(p => {
          p.isInWishlist = wishlistSet.has(p.productid);
        });
        this.cdr.detectChanges();
      }
    });
  }

  loadUserCart() {
    this.http.get<{ productid: number; quantity: number; cartid: number }[]>(
      `https://localhost:7107/api/Treasure/Cart?ClientID=${this.clientId}`
    ).subscribe(cartItems => {
      const cartMap = new Map<number, { quantity: number; cartid: number }>();
      cartItems.forEach(item => cartMap.set(item.productid, { quantity: item.quantity, cartid: item.cartid }));
      this.products.forEach(p => {
        const cartItem = cartMap.get(p.productid);
        p.quantityInCart = cartItem ? cartItem.quantity : 0;
        p.cartid = cartItem ? cartItem.cartid : undefined;
      });
      this.updateCartCount();
      this.cdr.detectChanges();
    });
  }

  addToCart(product: Product) {
    if ((product.quantityInCart || 0) >= product.productquentity) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock Limit',
        text: 'Cannot add more than available stock!',
        customClass: {
          popup: 'my-swal-popup',
          title: 'my-swal-title',
          confirmButton: 'my-swal-button'
        }
      });
      return;
    }

    const body = {
      ClientID: this.clientId,
      Productid: product.productid,
      Productimage: product.productimage,
      Quantity: 1,
      Price: product.price
    };

    this.http.post<any>("https://localhost:7107/api/Treasure/AddToCart", body)
      .subscribe({
        next: data => {
          product.quantityInCart = (product.quantityInCart || 0) + 1;
          if (!product.cartid && data.totalQuantity > 0) this.loadUserCart();
          this.updateCartCount();
          this.cdr.detectChanges();
        },
        error: () => Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error adding to cart!',
          customClass: {
            popup: 'my-swal-popup',
            title: 'my-swal-title',
            confirmButton: 'my-swal-button'
          }
        })
      });
  }

  updateCartQuantity(product: Product, change: number) {
    if (!product.cartid) {
      if (change === 1) this.addToCart(product);
      return;
    }

    const newQty = (product.quantityInCart || 0) + change;

    if (newQty === 0) {
      this.http.get<any>(`https://localhost:7107/api/Treasure/RemoveItem?Cartid=${product.cartid}`)
        .subscribe(() => {
          product.quantityInCart = 0;
          product.cartid = undefined;
          this.updateCartCount();
          this.cdr.detectChanges();
        });
      return;
    }

    this.http.get<any>(`https://localhost:7107/api/Treasure/UpdateCartQuantity?Cartid=${product.cartid}&Quantity=${newQty}`)
      .subscribe(res => {
        if (res.success) {
          product.quantityInCart = newQty;
          this.updateCartCount();
          this.cdr.detectChanges();
        }
      });
  }

  updateCartCount() {
    const total = this.products.reduce((sum, p) => sum + (p.quantityInCart || 0), 0);
    this.cartService.setCartCount(total);
  }

  searchItems() {
    if (!this.searchText.trim()) {
      this.loadProducts();
      return;
    }

    this.http.get<Product[]>(`https://localhost:7107/api/Treasure/SearchProduct?name=${this.searchText}`)
      .subscribe(data => {
        const currentProductsMap = new Map<number, Product>();
        this.products.forEach(p => currentProductsMap.set(p.productid, p));

        const updatedProducts: Product[] = [];
        data.forEach(p => {
          if (currentProductsMap.has(p.productid)) {
            const existing = currentProductsMap.get(p.productid)!;
            existing.productname = p.productname;
            existing.productdescription = p.productdescription;
            existing.productimage = p.productimage;
            existing.price = p.price;
            existing.productquentity = p.productquentity;
            updatedProducts.push(existing);
          } else {
            updatedProducts.push({ ...p, quantityInCart: 0, isInWishlist: false });
          }
        });

        this.products.length = 0;
        this.products.push(...updatedProducts);
        this.cdr.detectChanges();
      });
  }

  toggleDescription(id: number) {
    this.expandedProduct = (this.expandedProduct === id) ? null : id;
  }

  openModal(product: Product) {
    this.selectedProduct = product;
    const modalEl = document.getElementById('productModal');
    if (modalEl) new Modal(modalEl).show();

    setTimeout(() => {
      if (this.lightbox) this.lightbox.destroy();
      this.lightbox = GLightbox({ selector: '.glightbox' });
    }, 200);
  }

  toggleWishlist(product: Product) {
    const payload = { ClientID: this.clientId, ProductID: product.productid };

    if (product.isInWishlist) {
      this.http.post<{ success: boolean; message: string }>(
        "https://localhost:7107/api/Treasure/RemoveWishlist",
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      ).subscribe(res => {
        if (res.success) {
          product.isInWishlist = false;
          this.cdr.detectChanges();
        } else {
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
        }
      });
    } else {
      this.http.post<{ success: boolean; message: string }>(
        "https://localhost:7107/api/Treasure/AddWishlist",
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      ).subscribe(res => {
        if (res.success) {
          product.isInWishlist = true;
          this.cdr.detectChanges();
        } else {
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
        }
      });
    }
  }
}
