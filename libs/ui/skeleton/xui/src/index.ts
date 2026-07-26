import { XuiSkeleton } from './lib/skeleton';
import { XuiSkeletonMask } from './lib/skeleton-mask';

export * from './lib/skeleton';
export * from './lib/skeleton-mask';

export const XuiSkeletonImports = [XuiSkeleton, XuiSkeletonMask] as const;
