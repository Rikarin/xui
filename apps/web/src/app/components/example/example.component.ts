import {Component, Input, OnInit} from '@angular/core';
import {InputBoolean} from "xui";

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {
  @Input() stackBlitz: string;
  @Input() code: string;
  @Input() @InputBoolean() todo: boolean;

  constructor() {}

  ngOnInit(): void {}
}
