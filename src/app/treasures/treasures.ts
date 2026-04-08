import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import GLightbox from 'glightbox';
import { UserService } from '../Service/user';
import { CartService } from '../Service/cart.service';
import { WishlistService } from '../Service/wishlist.service';

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
      alert("Please login first!");
      window.location.href = "/login";
      return;
    }

    this.clientId = this.user.ClientID;
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>("https://localhost:7107/api/Treasure/GetProducts")
      .subscribe(products => {
        // Initialize products but keep isInWishlist false for now
        this.products = products.map(p => ({
          ...p,
          quantityInCart: 0,
          isInWishlist: false
        }));

        // Load cart quantities
        this.loadUserCart();

        // Load wishlist after products loaded
        this.loadWishlist();
      });
  }

  loadWishlist() {
    this.wishlistService.getWishlist(this.clientId).subscribe(res => {
      if (res.success && res.wishlist) {

        const wishlistSet = new Set<number>();
        (res.wishlist as any[]).forEach(item => wishlistSet.add(item.productID));

        // Update your products
        this.products.forEach(p => {
          p.isInWishlist = wishlistSet.has(p.productid); // only true if in wishlist
        });

        this.cdr.detectChanges(); // refresh UI
      }
    });
  }

  /** Load user's cart quantities */
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


  /** Add a product to cart */
  addToCart(product: Product) {
    if ((product.quantityInCart || 0) >= product.productquentity) {
      alert("Cannot add more than available stock!");
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
          if (!product.cartid && data.totalQuantity > 0) {
            this.loadUserCart();
          }
          this.updateCartCount();
          this.cdr.detectChanges();
        },
        error: () => alert("Error adding to cart")
      });
  }

  /** Update quantity of a product in cart */
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

  /** Update total cart count in service */
  updateCartCount() {
    const total = this.products.reduce((sum, p) => sum + (p.quantityInCart || 0), 0);
    this.cartService.setCartCount(total);
  }

  /** Search products */
  searchItems() {
    if (!this.searchText.trim()) {
      this.loadProducts();
      return;
    }

    this.http.get<Product[]>(`https://localhost:7107/api/Treasure/SearchProduct?name=${this.searchText}`)
      .subscribe(data => {
        // Step 1: create a map of current products
        const currentProductsMap = new Map<number, Product>();
        this.products.forEach(p => currentProductsMap.set(p.productid, p));

        // Step 2: update existing products or add new ones
        const updatedProducts: Product[] = [];
        data.forEach(p => {
          if (currentProductsMap.has(p.productid)) {
            const existing = currentProductsMap.get(p.productid)!;
            // update only the properties that come from API
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

        // Step 3: assign back to products array
        this.products.length = 0;
        this.products.push(...updatedProducts);

        this.cdr.detectChanges();
      });
  }

  /** Toggle expanded description */
  toggleDescription(id: number) {
    this.expandedProduct = (this.expandedProduct === id) ? null : id;
  }

  /** Open modal for product */
  openModal(product: Product) {
    this.selectedProduct = product;
    const modalEl = document.getElementById('productModal');
    if (modalEl) new Modal(modalEl).show();

    setTimeout(() => {
      if (this.lightbox) this.lightbox.destroy();
      this.lightbox = GLightbox({ selector: '.glightbox' });
    }, 200);
  }

  /** Toggle wishlist add/remove */
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
          this.cdr.detectChanges(); // force UI update
        } else alert(res.message);
      });
    } else {
      this.http.post<{ success: boolean; message: string }>(
        "https://localhost:7107/api/Treasure/AddWishlist",
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      ).subscribe(res => {
        if (res.success) {
          product.isInWishlist = true;
          this.cdr.detectChanges(); // force UI update
        } else alert(res.message);
      });
    }
  }
}
