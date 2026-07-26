import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { XPaginator, type XPaginatorState } from './paginator';

@Component({
  selector: 'x-paginator-host',
  imports: [XPaginator],
  template: `
    <ng-template
      xPaginator
      [xPaginatorTotalElements]="totalElements()"
      [xPaginatorPageSize]="pageSize()"
      (xPaginatorStateChange)="states.push($event)"
      let-ctx
    >
      <span class="range">{{ ctx.state().startIndex }}-{{ ctx.state().endIndex }}</span>
      <button class="prev" [disabled]="!ctx.decrementable()" (click)="ctx.decrement()">Prev</button>
      <button class="next" [disabled]="!ctx.incrementable()" (click)="ctx.increment()">Next</button>
    </ng-template>
  `
})
class PaginatorHost {
  readonly totalElements = signal(50);
  readonly pageSize = signal(10);
  readonly states: XPaginatorState[] = [];
}

function setup() {
  TestBed.configureTestingModule({ imports: [PaginatorHost] });
  const fixture = TestBed.createComponent(PaginatorHost);
  fixture.detectChanges();

  return fixture;
}

const text = (host: HTMLElement, selector: string) => host.querySelector(selector)?.textContent?.trim();
const click = (host: HTMLElement, selector: string) => host.querySelector<HTMLButtonElement>(selector)?.click();

describe('XPaginator', () => {
  it('exposes the state of the first page through its template context', () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement;

    expect(text(host, '.range')).toBe('0-9');
    expect(host.querySelector<HTMLButtonElement>('.prev')?.disabled).toBe(true);
    expect(host.querySelector<HTMLButtonElement>('.next')?.disabled).toBe(false);
  });

  it('navigates with increment and decrement', () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement;

    click(host, '.next');
    fixture.detectChanges();
    expect(text(host, '.range')).toBe('10-19');

    click(host, '.prev');
    fixture.detectChanges();
    expect(text(host, '.range')).toBe('0-9');
  });

  it('goes back to the first page when the page size changes', () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement;

    click(host, '.next');
    fixture.detectChanges();

    fixture.componentInstance.pageSize.set(25);
    fixture.detectChanges();

    expect(text(host, '.range')).toBe('0-24');
  });

  it('emits stateChange whenever the state changes', () => {
    const fixture = setup();
    const { states } = fixture.componentInstance;

    expect(states.at(-1)).toMatchObject({ currentPage: 0, startIndex: 0, endIndex: 9, totalElements: 50 });

    click(fixture.nativeElement, '.next');
    fixture.detectChanges();

    expect(states.at(-1)).toMatchObject({ currentPage: 1, startIndex: 10, endIndex: 19 });
  });

  it('stops incrementing on the last page', () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement;

    fixture.componentInstance.totalElements.set(15);
    fixture.detectChanges();

    click(host, '.next');
    fixture.detectChanges();

    expect(text(host, '.range')).toBe('10-14');
    expect(host.querySelector<HTMLButtonElement>('.next')?.disabled).toBe(true);
  });
});
