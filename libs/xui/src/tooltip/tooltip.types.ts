import { ElementRef } from '@angular/core';

export type TooltipPosition = 'left' | 'right' | 'top' | 'bottom';
export type TooltipAnchor = HTMLElement | ElementRef | { elementRef: ElementRef };
