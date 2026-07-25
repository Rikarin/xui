import { XuiTimeline } from './lib/timeline';
import { XuiTimelineItem } from './lib/timeline-item';

export * from './lib/timeline';
export * from './lib/timeline-item';

export const XuiTimelineImports = [XuiTimeline, XuiTimelineItem] as const;
