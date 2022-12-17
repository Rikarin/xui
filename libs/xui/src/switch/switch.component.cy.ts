import { TestBed } from '@angular/core/testing';
import { SwitchComponent } from './switch.component';
import { FormControl } from '@angular/forms';

describe('Xui Switch', () => {
  it('mounts', () => {
    const model = new FormControl();

    TestBed.overrideComponent(SwitchComponent, { add: { undefined } });
    cy.mount(SwitchComponent, {
      componentProperties: {
        formControl: model
      }
    });

    cy.get('.xui-switch').click();
    // expect(model.value).to.be.false;
  });
});
