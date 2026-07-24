import { XuiSkeleton } from './lib/skeleton';
import { XuiSkeletonDirective } from './lib/skeleton.directive';

export * from './lib/skeleton';
export * from './lib/skeleton.directive';

export const XuiSkeletonImports = [XuiSkeleton, XuiSkeletonDirective] as const;
