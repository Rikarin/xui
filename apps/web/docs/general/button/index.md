Button is an enhanced version of the standard button element,
featuring support for icons and theming.

### Import

```ts
import { XuiButtonModule } from '@xui/components';
```

## Types

Button can have different types.

### Normal

The text displayed on a button is defined as its content.

{{ NgDocActions.demo("ButtonExample2Component") }}

```html
<xui-button color="primary">Submit</xui-button>
<xui-button color="primary-alt">Submit</xui-button>
<xui-button color="secondary">Submit</xui-button>
<xui-button color="success">Submit</xui-button>
<xui-button color="warning">Submit</xui-button>
<xui-button color="error">Submit</xui-button>
<xui-button color="info">Submit</xui-button>
<xui-button color="minimal">Submit</xui-button>
```

### Raised

The raised button is the most commonly used button.

{{ NgDocActions.demo("ButtonExample2Component", { inputs: { type: 'raised' } }) }}

```html
<xui-button color="primary" type="raised">Submit</xui-button>
<xui-button color="primary-alt" type="raised">Submit</xui-button>
<xui-button color="secondary" type="raised">Submit</xui-button>
<xui-button color="success" type="raised">Submit</xui-button>
<xui-button color="warning" type="raised">Submit</xui-button>
<xui-button color="error" type="raised">Submit</xui-button>
<xui-button color="info" type="raised">Submit</xui-button>
<xui-button color="minimal" type="raised">Submit</xui-button>
```

### Dashed

{{ NgDocActions.demo("ButtonExample2Component", { inputs: { type: 'dashed' } }) }}

```html
<xui-button color="primary" type="dashed">Submit</xui-button>
<xui-button color="primary-alt" type="dashed">Submit</xui-button>
<xui-button color="secondary" type="dashed">Submit</xui-button>
<xui-button color="success" type="dashed">Submit</xui-button>
<xui-button color="warning" type="dashed">Submit</xui-button>
<xui-button color="error" type="dashed">Submit</xui-button>
<xui-button color="info" type="dashed">Submit</xui-button>
<xui-button color="minimal" type="dashed">Submit</xui-button>
```

### Stroked

{{ NgDocActions.demo("ButtonExample2Component", { inputs: { type: 'stroked' } }) }}

```html
<xui-button color="primary" type="stroked">Submit</xui-button>
<xui-button color="primary-alt" type="stroked">Submit</xui-button>
<xui-button color="secondary" type="stroked">Submit</xui-button>
<xui-button color="success" type="stroked">Submit</xui-button>
<xui-button color="warning" type="stroked">Submit</xui-button>
<xui-button color="error" type="stroked">Submit</xui-button>
<xui-button color="info" type="stroked">Submit</xui-button>
<xui-button color="minimal" type="stroked">Submit</xui-button>
```

### Fab

{{ NgDocActions.demo("ButtonExample2Component", { inputs: { type: 'fab' } }) }}

```html
<xui-button color="primary" type="fab">Submit</xui-button>
<xui-button color="primary-alt" type="fab">Submit</xui-button>
<xui-button color="secondary" type="fab">Submit</xui-button>
<xui-button color="success" type="fab">Submit</xui-button>
<xui-button color="warning" type="fab">Submit</xui-button>
<xui-button color="error" type="fab">Submit</xui-button>
<xui-button color="info" type="fab">Submit</xui-button>
<xui-button color="minimal" type="fab">Submit</xui-button>
```

### Icons

Icons of a button can be defined as the content of the button.

{{ NgDocActions.demo("ButtonExample3Component") }}

```html
<xui-button color="success" type="icon">
  <xui-icon icon="check"></xui-icon>
</xui-button>
<xui-button color="primary" type="normal"><xui-icon icon="check" /> Submit</xui-button>
<xui-button color="secondary" type="dashed">Submit <xui-icon icon="check" /></xui-button>
<xui-button color="success" type="raised"><xui-icon icon="check" /> Submit</xui-button>
<xui-button color="warning" type="stroked"><xui-icon icon="check" /> Submit</xui-button>
<xui-button color="error" type="fab"><xui-icon icon="check" /> Failed Successfully</xui-button>
```

### Icon Variants

{{ NgDocActions.demo("ButtonExample7Component") }}

```html
<div>
  <xui-button color="primary" type="icon"><xui-icon icon="check" /></xui-button>
  <xui-button color="primary-alt" type="icon"><xui-icon icon="check" /></xui-button>
  <xui-button color="secondary" type="icon"><xui-icon icon="check" /></xui-button>
  <xui-button color="success" type="icon"><xui-icon icon="check" /></xui-button>
  <xui-button color="warning" type="icon"><xui-icon icon="check" /></xui-button>
  <xui-button color="error" type="icon"><xui-icon icon="check" /></xui-button>
  <xui-button color="info" type="icon"><xui-icon icon="check" /></xui-button>
</div>
<div>
  <xui-button color="primary" type="fab"><xui-icon icon="check" /></xui-button>
  <xui-button color="primary-alt" type="fab"><xui-icon icon="check" /></xui-button>
  <xui-button color="secondary" type="fab"><xui-icon icon="check" /></xui-button>
  <xui-button color="success" type="fab"><xui-icon icon="check" /></xui-button>
  <xui-button color="warning" type="fab"><xui-icon icon="check" /></xui-button>
  <xui-button color="error" type="fab"><xui-icon icon="check" /></xui-button>
  <xui-button color="info" type="fab"><xui-icon icon="check" /></xui-button>
</div>
<div>
  <xui-button color="primary" type="raised"><xui-icon icon="check" /></xui-button>
  <xui-button color="primary-alt" type="raised"><xui-icon icon="check" /></xui-button>
  <xui-button color="secondary" type="raised"><xui-icon icon="check" /></xui-button>
  <xui-button color="success" type="raised"><xui-icon icon="check" /></xui-button>
  <xui-button color="warning" type="raised"><xui-icon icon="check" /></xui-button>
  <xui-button color="error" type="raised"><xui-icon icon="check" /></xui-button>
  <xui-button color="info" type="raised"><xui-icon icon="check" /></xui-button>
</div>
<div>
  <xui-button color="primary" type="dashed"><xui-icon icon="check" /></xui-button>
  <xui-button color="primary-alt" type="dashed"><xui-icon icon="check" /></xui-button>
  <xui-button color="secondary" type="dashed"><xui-icon icon="check" /></xui-button>
  <xui-button color="success" type="dashed"><xui-icon icon="check" /></xui-button>
  <xui-button color="warning" type="dashed"><xui-icon icon="check" /></xui-button>
  <xui-button color="error" type="dashed"><xui-icon icon="check" /></xui-button>
  <xui-button color="info" type="dashed"><xui-icon icon="check" /></xui-button>
</div>
```

### Color

Color defines the color of the button. Default is `primary`.

{{ NgDocActions.demo("ButtonExample2Component", { inputs: { type: 'raised' } }) }}

```html
<xui-button color="primary" type="raised">Submit</xui-button>
<xui-button color="primary-alt" type="raised">Submit</xui-button>
<xui-button color="secondary" type="raised">Submit</xui-button>
<xui-button color="success" type="raised">Submit</xui-button>
<xui-button color="warning" type="raised">Submit</xui-button>
<xui-button color="error" type="raised">Submit</xui-button>
<xui-button color="info" type="raised">Submit</xui-button>
<xui-button color="minimal" type="raised">Submit</xui-button>
```

### Size

Button sizes are available in three variants: `small`, `medium`, and `large`.

{{ NgDocActions.demo("ButtonExample4Component") }}

```html
<xui-button type="raised" size="small"><xui-icon icon="check" /> Small</xui-button>
<xui-button type="raised" size="medium"><xui-icon icon="check" /> Medium</xui-button>
<xui-button type="raised" size="large"><xui-icon icon="check" /> Large</xui-button>
```

### Disabled

Disabled buttons can't be clicked.

{{ NgDocActions.demo("ButtonExample5Component") }}

```html
<xui-button type="normal" disabled>Submit</xui-button>
<xui-button type="raised" disabled>Submit</xui-button>
<xui-button type="dashed" disabled>Submit</xui-button>
```

### Shine

Grab user's attention by highlighting the button.

{{ NgDocActions.demo("ButtonExample6Component") }}

```html
<xui-button color="success" type="raised" shine>Submit</xui-button>
<xui-button color="primary" type="raised" shine>Submit</xui-button>
<xui-button color="error" type="raised" shine>Submit</xui-button>
```

### Asynchronous

- click async
- stateDelay

### Button Group

TODO:

- group examples
- group configuration behavior

### Accessibility

TODO:

- (keyboard support)
- Configuration service and the directive stuff

### Theming

{{ NgDocActions.demo("ButtonExample1Component") }}

# Playground

{{ NgDocActions.playground("ButtonPlayground") }}

# API

{{ NgDocApi.api("libs/xui/src/button/button.ts#XuiButton") }}

<div id="end"></div>
