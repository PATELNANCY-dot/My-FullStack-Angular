import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-add.html',
  styleUrl: './product-add.css'
})
export class ProductAdd {

  productname = '';
  price = 0;
  productdescription = '';
  productquentity = 0;

  selectedFile!: File;

  constructor(private http: HttpClient, private router: Router) { }

  onFileSelected(event: any) {

    this.selectedFile = event.target.files[0];

  }

  addProduct() {

    const formData = new FormData();

    formData.append("productname", this.productname);
    formData.append("price", this.price.toString());
    formData.append("productdescription", this.productdescription);
    formData.append("productquentity", this.productquentity.toString());
    formData.append("image", this.selectedFile);

    this.http.post(
      "https://localhost:7107/api/Treasure/InsertProduct",
      formData
    ).subscribe(res => {

      alert("Product Added");
      this.router.navigate(['./admin/product-list'])
    }, err => {

      console.log(err);

    });

  }

}
