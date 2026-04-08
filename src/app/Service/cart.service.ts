import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartCountSource = new BehaviorSubject<number>(
    Number(sessionStorage.getItem('cartCount')) || 0
  );

  cartCount$ = this.cartCountSource.asObservable();

  setCartCount(count: number) {

    // save in session storage
    sessionStorage.setItem('cartCount', count.toString());

    // update observable
    this.cartCountSource.next(count);

  }

}
