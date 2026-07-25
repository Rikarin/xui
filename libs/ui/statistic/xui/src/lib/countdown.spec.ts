import { render } from '@xui/testing';
import { XuiCountdown } from './countdown';

describe('XuiCountdown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const setup = (targetOffsetMs: number, onFinished?: () => void) =>
    render(`<xui-countdown [target]="props().target" (finished)="props().onFinished()" />`, {
      imports: [XuiCountdown],
      props: { target: Date.now() + targetOffsetMs, onFinished: onFinished ?? (() => undefined) }
    });

  it('renders the initial remaining time', () => {
    const { query } = setup((3 * 3600 + 4 * 60 + 5) * 1000);
    expect(query('xui-countdown').textContent?.trim()).toBe('03:04:05');
  });

  it('ticks down every second', () => {
    const { query, detect } = setup(5000);
    expect(query('xui-countdown').textContent?.trim()).toBe('00:00:05');

    jest.advanceTimersByTime(2000);
    detect();

    expect(query('xui-countdown').textContent?.trim()).toBe('00:00:03');
  });

  it('emits finished once when it reaches zero', () => {
    const finished = jest.fn();
    const { detect } = setup(2000, finished);

    jest.advanceTimersByTime(3000);
    detect();
    jest.advanceTimersByTime(2000);
    detect();

    expect(finished).toHaveBeenCalledTimes(1);
  });
});
