import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  errorControl = new FormControl(null, Validators.required);
  textAreaControl = new FormControl('Loaded text', Validators.required);

  constructor() {}

  ngOnInit() {}
}
