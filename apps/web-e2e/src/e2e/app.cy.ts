import { getLogo } from '../support/app.po';

describe('openapp', () => {
  beforeEach(() => cy.visit('/'));

  it('should display logo', () => {
    getLogo().contains('xUI');
  });
});
