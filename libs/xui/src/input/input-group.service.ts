import { Injectable } from '@angular/core';
import { InputSize } from './input.types';

@Injectable()
export class InputGroupService {
  size: InputSize = 'large';
}
