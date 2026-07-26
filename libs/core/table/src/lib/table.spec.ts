import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { XCellDef } from './cell-def';
import { XColumnDef } from './column-def';
import { XHeaderDef } from './header-def';
import { XTable } from './table';

type User = { name: string; age: number };

@Component({
  selector: 'x-table-host',
  imports: [XTable, XColumnDef, XCellDef, XHeaderDef],
  template: `
    <x-table
      [dataSource]="users()"
      [displayedColumns]="displayedColumns()"
      [interactiveRows]="interactive()"
      [bodyRowClasses]="bodyRowClasses()"
      (rowClick)="clicked.push($event)"
    >
      <x-column-def name="name">
        <span *xHeaderDef>Name</span>
        <span *xCellDef="let user">{{ user.name }}</span>
      </x-column-def>
      <x-column-def name="age">
        <span *xHeaderDef>Age</span>
        <span *xCellDef="let user">{{ user.age }}</span>
      </x-column-def>
    </x-table>
  `
})
class TableHost {
  readonly users = signal<User[]>([
    { name: 'Ada', age: 36 },
    { name: 'Alan', age: 41 }
  ]);
  readonly displayedColumns = signal(['name', 'age']);
  readonly interactive = signal(false);
  readonly bodyRowClasses = signal('');
  readonly clicked: User[] = [];
}

function setup() {
  TestBed.configureTestingModule({ imports: [TableHost] });
  const fixture = TestBed.createComponent(TableHost);
  fixture.detectChanges();

  return fixture;
}

const rows = (host: HTMLElement) => Array.from(host.querySelectorAll<HTMLElement>('cdk-row'));

describe('XTable', () => {
  it('registers projected column defs with the CdkTable and renders the rows', () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('cdk-header-row')?.textContent).toContain('Name');
    expect(rows(host)).toHaveLength(2);
    expect(rows(host)[0].textContent).toContain('Ada');
    expect(rows(host)[1].textContent).toContain('41');
  });

  it('re-renders when the displayed columns change', () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement;

    fixture.componentInstance.displayedColumns.set(['name']);
    fixture.detectChanges();

    expect(rows(host)[0].textContent).toContain('Ada');
    expect(rows(host)[0].textContent).not.toContain('36');
  });

  it('emits rowClick with the row data', () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement;

    rows(host)[1].click();

    expect(fixture.componentInstance.clicked).toEqual([{ name: 'Alan', age: 41 }]);
  });

  it('only advertises rows as interactive when asked to', () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement;

    expect(rows(host)[0].getAttribute('role')).toBe('row');
    expect(rows(host)[0].tabIndex).toBe(-1);

    fixture.componentInstance.interactive.set(true);
    fixture.detectChanges();

    expect(rows(host)[0].getAttribute('role')).toBe('button');
    expect(rows(host)[0].tabIndex).toBe(0);
    expect(rows(host)[0].classList).toContain('row-interactive');
  });

  it('applies the row class model inputs', () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement;

    fixture.componentInstance.bodyRowClasses.set('styled-row');
    fixture.detectChanges();

    expect(rows(host)[0].classList).toContain('styled-row');
  });
});
