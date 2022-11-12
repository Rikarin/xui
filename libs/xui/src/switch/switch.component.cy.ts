import { XuiSwitchComponent } from './switch.component';
import { FormControl } from '@angular/forms';

describe('Xui Switch', () => {
  it('mounts', () => {
    const model = new FormControl();

    cy.mount(XuiSwitchComponent, {
      componentProperties: {
        formControl: model
      }
    });

    cy.get('.xui-switch').click();
    // expect(model.value).to.be.false;
  });
});
