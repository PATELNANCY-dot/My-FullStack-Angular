import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {

  productMenuOpen = false;
  constructor(private router: Router) { }
  toggleProductMenu() {
    this.productMenuOpen = !this.productMenuOpen;
  }

  logout() {

    sessionStorage.removeItem("adminLoggedIn");

    this.router.navigate(['/admin/login']);

  }
}
