import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiTextarea } from '../index';

@Component({
  selector: 'xui-root',
  imports: [XuiTextarea],
  template: `<textarea xuiTextarea autoResize>Some content</textarea>`
})
class ServerHost {}

describe('XuiTextarea on the server', () => {
  it('does not pin a height it has no way of measuring', async () => {
    const html = await renderApplication(context => bootstrapApplication(ServerHost, {}, context), {
      document: '<html><body><xui-root></xui-root></body></html>'
    });

    // `scrollHeight` is `undefined` on a server element, and the template
    // literal around it does not fail — it stringifies. So the box ships with
    // `style="height: undefinedpx"`, which is markup the browser has to discard
    // rather than anything that reaches a log.
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('height:');
  });
});
