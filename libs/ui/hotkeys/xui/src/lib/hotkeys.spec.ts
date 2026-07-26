import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@xui/testing';
import { injectHotkeys, XuiHotkeysService } from './hotkeys.service';

// The pure combo logic (parse/match/format) is specced in `@xui/core/hotkeys`.

const keydown = (init: KeyboardEventInit, target: Element = document.body) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};

@Component({ selector: 'xui-hotkeys-host', template: '' })
class HostComponent {
  saved = 0;
  service = injectHotkeys([{ combo: 'mod+s', label: 'Save', group: 'File', onKeyDown: () => this.saved++ }]);
}

describe('XuiHotkeysService', () => {
  it('dispatches a matching combo to its handler', () => {
    const { fixture } = render('<xui-hotkeys-host />', { imports: [HostComponent] });
    const host = fixture.debugElement.query(n => n.name === 'xui-hotkeys-host').componentInstance as HostComponent;

    keydown({ key: 's', ctrlKey: true });

    expect(host.saved).toBe(1);
  });

  it('unregisters a component hotkey when it is destroyed', () => {
    const { fixture } = render('<xui-hotkeys-host />', { imports: [HostComponent] });
    const service = TestBed.inject(XuiHotkeysService);
    expect(service.hotkeys().length).toBe(1);

    fixture.destroy();

    expect(service.hotkeys().length).toBe(0);
  });

  it('groups registered hotkeys for the help view', () => {
    render('<xui-hotkeys-host />', { imports: [HostComponent] });
    const service = TestBed.inject(XuiHotkeysService);

    const grouped = service.grouped();
    expect(grouped).toEqual([{ group: 'File', items: [expect.objectContaining({ label: 'Save' })] }]);
  });

  it('ignores shortcuts fired from a text field unless allowed', () => {
    const { fixture } = render('<xui-hotkeys-host /><input id="f" />', { imports: [HostComponent] });
    const host = fixture.debugElement.query(n => n.name === 'xui-hotkeys-host').componentInstance as HostComponent;
    const input = document.getElementById('f') as HTMLInputElement;

    keydown({ key: 's', ctrlKey: true }, input);

    expect(host.saved).toBe(0);
  });
});
