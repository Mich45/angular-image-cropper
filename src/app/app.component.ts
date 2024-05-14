import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from './../environments/environment.development';
import { RouterOutlet } from '@angular/router';
// Import the CloudinaryModule.
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
import {fill} from "@cloudinary/url-gen/actions/resize";
import {focusOn} from "@cloudinary/url-gen/qualifiers/gravity";
import {FocusOn} from "@cloudinary/url-gen/qualifiers/focusOn";
import {autoGravity} from "@cloudinary/url-gen/qualifiers/gravity";

// Create and configure your Cloudinary instance.
const cld = new Cloudinary({
  cloud: {
    cloudName: 'cloudinarymich'
  }
});

// Fill cropping with face detection gravity
const fillCroppingWithFaces = (imageId: string) => {
  const myImage = cld.image(imageId);
  myImage.resize(fill().width(250).height(250).gravity(focusOn(FocusOn.faces())));
  return myImage.toURL();
};

// Automatic gravity cropping
const autoGravityCropping = (imageId: string) => {
  const myImage = cld.image(imageId);
  myImage.resize(fill().width(200).height(300).gravity(autoGravity()));
  return myImage.toURL();
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <input type="file" (change)="onFileSelected($event)" />
    <button (click)="uploadImage()" [disabled]="!selectedImage">Upload Image</button>

    <div *ngIf="originalImageUrl">
      <h2>Original Image</h2>
      <img [src]="originalImageUrl" alt="Original Image" />
    </div>

    <div *ngIf="fillCroppingWithFacesUrl">
      <h2>Fill Cropping with Face Detection Gravity</h2>
      <img [src]="fillCroppingWithFacesUrl" alt="Fill Cropping with Face Detection Gravity" />
    </div>

    <div *ngIf="autoGravityCroppingUrl">
      <h2>Automatic Gravity Cropping</h2>
      <img [src]="autoGravityCroppingUrl" alt="Automatic Gravity Cropping" />
    </div>
  `
})
export class AppComponent {
  selectedImage: string | null = null;
  originalImageUrl: string | null = null;

  fillCroppingWithFacesUrl: string | null = null;
  autoGravityCroppingUrl: string | null = null;
  customGravityCroppingUrl: string | null = null;
  aspectRatioCroppingUrl: string | null = null;

  cloudName = 'cloudinarymich'; // Replace with your Cloudinary cloud name
  uploadPreset = 'new-preset'; // Replace with your Cloudinary upload preset

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.selectedImage = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  uploadImage() {
    if (this.selectedImage) {
      const file = this.dataURItoBlob(this.selectedImage);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);

    const cloudinaryApiKey = environment.cloudinaryApiKey;
    const cloudinaryApiSecret = environment.cloudinaryApiSecret;

    const headers = new Headers();
    headers.append('Authorization', `Basic ${btoa(`${cloudinaryApiKey}:${cloudinaryApiSecret}`)}`);

      fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/upload`, {
        method: 'POST',
        headers: headers,
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          console.log('Image uploaded:', data);
          this.originalImageUrl = data.secure_url;
          this.updateCroppedImages(data.public_id);
        })
        .catch(error => {
          console.error('Error uploading image:', error);
        });
    }
  }

  updateCroppedImages(publicId: string) {
    this.fillCroppingWithFacesUrl = fillCroppingWithFaces(publicId);
    this.autoGravityCroppingUrl = autoGravityCropping(publicId);
  }

  dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
}