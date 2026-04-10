import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout-component/main-layout-component';
import { Home } from './home/home';
import { AboutUs } from './about-us/about-us';
import { Contact } from './contact/contact';
import { Treasures } from './treasures/treasures';
import { Cart } from './cart/cart';
import { History } from './history/history';
import { Login } from './login/login';
import { Register } from './register/register';
import { WishList } from './wish-list/wish-list';


export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // redirect root to home
      { path: 'home', component: Home },
      { path: 'about-us', component: AboutUs },
      { path: 'contact', component: Contact },
      { path: 'treasures', component: Treasures },
      { path: 'cart', component: Cart },
      { path: 'history', component: History },
      { path: 'wish-list', component: WishList }
    ]
  },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // ADMIN MODULE
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '' },

];

