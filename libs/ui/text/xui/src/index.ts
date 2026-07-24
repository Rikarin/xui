import { XuiHeading } from './lib/heading';
import { XuiBlockquote, XuiCode, XuiCodeBlock, XuiList } from './lib/html';
import { XuiText } from './lib/text';

export * from './lib/heading';
export * from './lib/html';
export * from './lib/text';

export const XuiTextImports = [XuiText, XuiHeading, XuiBlockquote, XuiCode, XuiCodeBlock, XuiList] as const;
