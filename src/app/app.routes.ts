import { MainLayoutComponent } from './main-layout-component/main-layout-component';
import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Register } from './register/register';
import { AboutUs } from './about-us/about-us'
import { Contact } from './contact/contact'
import { Treasures } from './treasures/treasures';
import { Cart } from './cart/cart';
import { History } from './history/history'

export const routes: Routes = [


  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: MainLayoutComponent, // Root layout with navbar
    children: [
      { path: 'home', component: Home },
      { path: 'about-us', component: AboutUs },
      { path: 'contact', component: Contact },
      { path: 'treasures', component: Treasures },
      { path: 'cart', component: Cart },
      { path: 'history', component: History },
    ]
  },


{ path: '**', redirectTo: '' }
];
