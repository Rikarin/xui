import { NgDocPage } from '@ng-doc/core';
import { XuiCheckboxComponent } from '@xui/checkbox';
import GeneralCategory from '../ng-doc.category';

const AutoGenerationPage: NgDocPage = {
  title: 'Checkbox',
  mdFile: './index.md',
  category: GeneralCategory,
  imports: [XuiCheckboxComponent],

  playgrounds: {
    CheckboxPlayground: {
      target: XuiCheckboxComponent,
      template: '<ng-doc-selector />',
      controls: {
        size: { type: 'Size', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
        disabled: 'boolean'
        // checked: { type: 'Checked', options: ['true', 'false', 'indeterminate'] },
      }
    }
  }
};

export default AutoGenerationPage;
