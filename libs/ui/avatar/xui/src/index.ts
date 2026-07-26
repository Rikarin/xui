import { XuiAvatar } from './lib/avatar';
import { XuiAvatarGroup } from './lib/avatar-group';

export * from './lib/avatar';
export * from './lib/avatar-group';
export * from './lib/avatar.token';

export const XuiAvatarImports = [XuiAvatar, XuiAvatarGroup] as const;
