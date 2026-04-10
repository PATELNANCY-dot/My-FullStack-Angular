import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { WishlistService } from '../Service/wishlist.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../Service/user';
import { FormsModule } from '@angular/forms';

interface WishlistItem {
  productID: number;
  productName: string;
  productImage: string;
  note?: string;
  tags?: string[];
  showTagPopup?: boolean;
  showNote?: boolean;
}

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wish-list.html',
  styleUrls: ['./wish-list.css'],
})
export class WishList implements OnInit {

  wishlist: WishlistItem[] = [];
  clientId!: number;
  availableTags = ['Gift', 'Home', 'Outdoor', 'Office', 'Birthday']; // example tags

  constructor(
    private wishlistService: WishlistService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const user = this.userService.getUser();
    this.clientId = user?.ClientID || 0;
    this.loadWishlist();
  }

  loadWishlist() {
    this.wishlistService.getWishlistWithNotes(this.clientId).subscribe((res: any) => {
      if (res.success) {
        this.wishlist = res.wishlist.map((item: any) => ({
          productID: item.productID,
          productName: item.productName,
          productImage: "https://localhost:7107/images/" + item.productimage,
          note: item.note || '',
          tags: item.tags ? item.tags.split(',') : [],
          showTagPopup: false
        }));
        this.cdr.detectChanges();
      }
    });
  }

  saveNote(item: WishlistItem) {
    const payload = {
      ClientID: this.clientId,
      ProductID: item.productID,
      Note: item.note || '',
      Tags: (item.tags || []).join(',')
    };
    item.showNote = false;

    this.wishlistService.addOrUpdateWishlist(payload).subscribe((res: any) => {
      if (res.success) {
        
        this.cdr.detectChanges();
      }
      // Removed alert; optionally handle errors silently
    });
  }

  removeFromWishlist(item: WishlistItem) {
    const payload = { ClientID: this.clientId, ProductID: item.productID };
    this.wishlistService.removeWishlist(payload).subscribe((res: any) => {
      if (res.success) {
        this.wishlist = this.wishlist.filter(w => w.productID !== item.productID);
        this.cdr.detectChanges();
      }
      // Removed alert; optionally handle errors silently
    });
  }

  toggleTag(item: WishlistItem, tag: string, checked: boolean) {
    if (!item.tags) item.tags = [];
    if (checked && !item.tags.includes(tag)) {
      item.tags.push(tag);
    } else {
      item.tags = item.tags.filter(t => t !== tag);
    }
  }

  toggleNote(item: WishlistItem) {
    item.showNote = !item.showNote;
    this.wishlist.forEach(w => {
      if (w.productID !== item.productID) w.showNote = false;
    });
  }
}
