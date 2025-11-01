import { NgDocPage } from '@ng-doc/core';
import { XuiButton } from '@xui/button';
import GeneralCategory from '../ng-doc.category';

// import { XuiButton, XuiButtonModule } from '@xui/components';
// import { ButtonExample1Component } from './examples/button-example-1.component';
// import { ButtonExample2Component } from './examples/button-example-2.component';
// import { ButtonExample3Component } from './examples/button-example-3.component';
// import { ButtonExample4Component } from './examples/button-example-4.component';
// import { ButtonExample5Component } from './examples/button-example-5.component';
// import { ButtonExample6Component } from './examples/button-example-6.component';
// import { ButtonExample7Component } from './examples/button-example-7.component';

const AutoGenerationPage: NgDocPage = {
  title: 'Button',
  mdFile: './index.md',
  category: GeneralCategory,
  imports: [XuiButton],
  // order: 1,

  // demos: {
  //   ButtonExample1Component,
  //   ButtonExample2Component,
  //   ButtonExample3Component,
  //   ButtonExample4Component,
  //   ButtonExample5Component,
  //   ButtonExample6Component,
  //   ButtonExample7Component
  // },

  playgrounds: {
    ButtonPlayground: {
      target: XuiButton,
      template: '<button xuiButton>Click me!</button>',
      controls: {
        disabled: 'boolean'
      }
    }
  }
};

export default AutoGenerationPage;
