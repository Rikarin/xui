import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

export function parseCss(value: string | number) {
  if (value == null) {
    return '';
  }

  return typeof value === 'string' ? value : `${value}px`;
}

export function inNextTick(): Promise<void> {
  const timer = new Subject<void>();
  Promise.resolve().then(() => timer.next());
  return timer.pipe(take(1)).toPromise();
}
