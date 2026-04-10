import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-edit.html',
  styleUrls: ['./product-edit.css']
})
export class ProductEdit implements OnInit {

  productid!: number;
  productname = '';
  price!: number;
  productdescription = '';
  imageFile: File | null = null;
  existingImage = '';
  productquentity!: number;

  loading = false;   // ⭐ NEW

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.productid = Number(this.route.snapshot.paramMap.get('productid'));

    if (this.productid > 0) {
      this.loadProduct();
    }
  }

  loadProduct() {
    this.loading = true;
    this.cd.detectChanges(); // show loader immediately

    const api = `https://localhost:7107/api/Admin/GetProductById/${this.productid}`;

    this.http.get<any>(api).subscribe({
      next: (res) => {

        this.productname = res.productname;
        this.price = res.price;
        this.productdescription = res.productdescription;
        this.productquentity = res.productquentity;
        this.existingImage = `https://localhost:7107/images/${res.productimage}`;

        this.loading = false;
        this.cd.detectChanges(); // update UI after data load
      },
      error: (err) => {
        console.error("Error loading product:", err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  onFileChange(event: any) {
    this.imageFile = event.target.files[0];
  }

  updateProduct() {

    const formData = new FormData();

    formData.append('ProductID', this.productid.toString());
    formData.append('Productname', this.productname);
    formData.append('Price', this.price.toString());
    formData.append('Productdescription', this.productdescription);
    formData.append('productquentity', this.productquentity.toString());

    if (this.imageFile) {
      formData.append('Image', this.imageFile);
    }

    this.http.post(
      'https://localhost:7107/api/Admin/UpdateProduct',
      formData
    ).subscribe({
      next: () => {
        alert('Product updated successfully!');
        this.router.navigate(['/admin/product-list']);
      },
      error: err => console.error(err)
    });
  }
}
