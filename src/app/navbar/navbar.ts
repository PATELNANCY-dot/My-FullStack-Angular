import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../Service/user';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../Service/cart.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
})
export class Navbar implements OnInit {

  cartCount: number = 0;

  constructor(
    public userService: UserService,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private cartService: CartService
  ) { }

  ngOnInit() {

    if (this.isLoggedIn) {
      this.loadCartCount();
    }
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cd.detectChanges();
    });

  }

  loadCartCount() {

    const user = this.userService.getUser();
    if (!user) return;

    const clientId = user.ClientID;

    this.http
      .get<any[]>(`https://localhost:7107/Treasure/Cart?ClientID=${clientId}`)
      .subscribe(res => {

        const count = res.reduce(
          (total, item) => total + Number(item.quantity),
          0
        );

        setTimeout(() => {
          this.cartService.setCartCount(count);
        });

      });

  }

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get userName(): string {
    const user = this.userService.getUser();
    if (!user) return '';
    return user.fullName || user.email.split('@')[0];
  }

  logout(): void {
    this.userService.clearUser();
  }

}
