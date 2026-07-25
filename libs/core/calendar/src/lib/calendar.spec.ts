import { XNativeDateAdapter } from '@xui/core/date-time';
import { buildMonthGrid, monthYearLabel, weekdayLabels } from './calendar';

const adapter = new XNativeDateAdapter();
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('buildMonthGrid', () => {
  it('produces a 6×7 grid', () => {
    const grid = buildMonthGrid(adapter, d(2024, 3, 15));

    expect(grid.length).toBe(6);
    expect(grid.every(week => week.length === 7)).toBe(true);
  });

  it('pads the first week with the trailing days of the previous month', () => {
    // March 2024 starts on a Friday; with Sunday-first the row starts Feb 25.
    const grid = buildMonthGrid(adapter, d(2024, 3, 1));

    expect(grid[0][0].label).toBe(25);
    expect(grid[0][0].inCurrentMonth).toBe(false);
    // The 1st sits in column 5 (Friday).
    expect(grid[0][5].label).toBe(1);
    expect(grid[0][5].inCurrentMonth).toBe(true);
  });

  it('respects a Monday-first week', () => {
    const grid = buildMonthGrid(adapter, d(2024, 3, 1), { firstDayOfWeek: 1 });

    // Monday-first: the leading row starts on Feb 26 (Monday).
    expect(grid[0][0].label).toBe(26);
  });

  it('flags today', () => {
    const today = adapter.now();
    const grid = buildMonthGrid(adapter, today);
    const todays = grid.flat().filter(cell => cell.isToday);

    expect(todays.length).toBe(1);
    expect(adapter.isSameDay(todays[0].date, today)).toBe(true);
  });

  it('disables days before min and after max', () => {
    const grid = buildMonthGrid(adapter, d(2024, 3, 15), { min: d(2024, 3, 10), max: d(2024, 3, 20) });
    const cell = (label: number) => grid.flat().find(c => c.inCurrentMonth && c.label === label)!;

    expect(cell(9).disabled).toBe(true);
    expect(cell(10).disabled).toBe(false);
    expect(cell(20).disabled).toBe(false);
    expect(cell(21).disabled).toBe(true);
  });

  it('disables days rejected by the filter', () => {
    // Disable weekends.
    const grid = buildMonthGrid(adapter, d(2024, 3, 15), {
      dateFilter: date => adapter.getDay(date) !== 0 && adapter.getDay(date) !== 6
    });
    const march2 = grid.flat().find(c => c.inCurrentMonth && c.label === 2)!; // a Saturday

    expect(march2.disabled).toBe(true);
  });
});

describe('weekdayLabels', () => {
  it('orders labels from the first day of the week', () => {
    const sundayFirst = weekdayLabels(0, 'en-US');
    const mondayFirst = weekdayLabels(1, 'en-US');

    expect(sundayFirst.length).toBe(7);
    expect(sundayFirst[0]).toMatch(/sun/i);
    expect(mondayFirst[0]).toMatch(/mon/i);
  });
});

describe('monthYearLabel', () => {
  it('formats the month and year', () => {
    expect(monthYearLabel(adapter, d(2024, 3, 15), 'en-US')).toBe('March 2024');
  });
});
