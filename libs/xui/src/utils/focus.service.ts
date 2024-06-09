import { Inject, Injectable, NgModule } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class XuiFocusService {
  constructor(@Inject(DOCUMENT) doc: Document) {
    doc.documentElement.addEventListener('mousedown', function () {
      doc.documentElement.classList.add('mouse-mode');
      doc.documentElement.classList.remove('keyboard-mode');
    });

    doc.documentElement.addEventListener('keydown', function (event: KeyboardEvent) {
      if (event.code == 'Tab') {
        doc.documentElement.classList.add('keyboard-mode');
        doc.documentElement.classList.remove('mouse-mode');
      }
    });

    window.addEventListener('focus', function () {
      doc.documentElement.classList.add('app-focused');
    });

    window.addEventListener('blur', function () {
      doc.documentElement.classList.remove('app-focused');
    });
  }
}

@NgModule({ providers: [XuiFocusService] })
export class XuiFocusModule {
  constructor(_: XuiFocusService) {}
}
