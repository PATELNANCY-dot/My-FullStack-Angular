import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayout } from './admin-layout/admin-layout';
import { Dashboard } from './components/dashboard/dashboard/dashboard';
import { ProductAdd } from './components/products/product-add/product-add';
import { ProductEdit } from './components/products/product-edit/product-edit';
import { ProductList } from './components/products/product-list/product-list';
import { OrderList } from './components/orders/order-list/order-list';
import { UserList } from './components/users/user-list/user-list';
import { AdminLogin } from './components/admin-login/admin-login';

const routes: Routes = [

  // LOGIN PAGE
  { path: 'login', component: AdminLogin },

  {
    path: '',
    component: AdminLayout,
    children: [

      { path: 'dashboard', component: Dashboard },
      { path: 'product-add', component: ProductAdd },
      { path: 'product-edit/:productid', component: ProductEdit },
      { path: 'product-list', component: ProductList },
      { path: 'order-list', component: OrderList },
      { path: 'user-list', component: UserList },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

    ]
  },

 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
