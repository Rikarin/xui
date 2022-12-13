import { ElementRef } from '@angular/core';

export type PopoverPosition = 'left' | 'right' | 'top' | 'bottom';
export type PopoverAnchor = HTMLElement | ElementRef | { elementRef: ElementRef };
