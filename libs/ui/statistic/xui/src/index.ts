import { XuiCountdown } from './lib/countdown';
import { XuiStatistic } from './lib/statistic';

export * from './lib/countdown';
export * from './lib/statistic';

export const XuiStatisticImports = [XuiStatistic, XuiCountdown] as const;
