// src/app/main-layout-component/main-layout-component.ts
import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  standalone: true,
  imports: [Navbar, RouterOutlet]
})
export class MainLayoutComponent { }
