import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  model = new FormGroup({
    first: new FormControl(),
    second: new FormControl()
  });

  constructor() {}

  ngOnInit(): void {}
}
