import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface WishlistResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private apiBase = "https://localhost:7107/api/Treasure";

  constructor(private http: HttpClient) { }

  addWishlist(data: any): Observable<WishlistResponse> {
    return this.http.post<WishlistResponse>(`${this.apiBase}/AddWishlist`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  removeWishlist(data: any): Observable<WishlistResponse> {
    return this.http.post<WishlistResponse>(`${this.apiBase}/RemoveWishlist`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getWishlist(clientId: number): Observable<{ success: boolean, wishlist: any[] }> {
    return this.http.get<{ success: boolean, wishlist: any[] }>(`${this.apiBase}/GetWishlist?ClientID=${clientId}`);
  }


  addOrUpdateWishlist(data: any) {
    return this.http.post(`${this.apiBase}/AddOrUpdateWishlist`, data);
  }

  getWishlistWithNotes(clientId: number) {
    return this.http.get(`${this.apiBase}/GetWishlistWithNotes?ClientID=${clientId}`);
  }
}
