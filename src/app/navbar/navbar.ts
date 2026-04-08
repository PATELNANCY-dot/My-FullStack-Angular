import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../Service/cart.service';
import { UserService, User } from '../Service/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, RouterModule],
})
export class Navbar implements OnInit {

  cartCount: number = 0;
  user: User | null = null;

  constructor(
    public userService: UserService,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit() {
    // Subscribe to user changes
    this.userService.user$.subscribe(user => {
      this.user = user;
      this.cd.detectChanges(); // update template
      if (this.isLoggedIn) {
        this.loadCartCount(); // load cart when logged in
      } else {
        this.cartCount = 0; // reset cart on logout
      }
    });

    // Subscribe to cart count changes
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cd.detectChanges();
    });
  }

  loadCartCount() {
    if (!this.user) return;
    const clientId = this.user.ClientID;

    this.http
      .get<any[]>(`https://localhost:7107/api/Treasure/Cart?ClientID=${clientId}`)
      .subscribe(res => {
        const count = res.reduce((total, item) => total + Number(item.quantity), 0);
        this.cartService.setCartCount(count);
      });
  }
  get isLoggedIn(): boolean {
    return !!this.userService.getUser()?.isLoggedIn;
  }


  get userName(): string {
    const user = this.userService.getUser();
    return user?.fullName || (user?.email?.split('@')[0]) || 'G';
  }


  logout() {
    this.userService.clearUser();
    this.router.navigate(['/home']);
  }
}
