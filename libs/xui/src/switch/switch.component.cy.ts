import { TestBed } from '@angular/core/testing';
import { XuiSwitchComponent } from './switch.component';
import { FormControl } from '@angular/forms';

describe('Xui Switch', () => {
  it('mounts', () => {
    const model = new FormControl();

    TestBed.overrideComponent(XuiSwitchComponent, { add: { undefined } });
    cy.mount(XuiSwitchComponent, {
      componentProperties: {
        formControl: model
      }
    });

    cy.get('.xui-switch').click();
    // expect(model.value).to.be.false;
  });
});
