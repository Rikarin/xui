import { XuiCodeBlock } from './lib/code-block';
import { XuiCodeBlockCopy } from './lib/code-block-copy';

export * from './lib/code-block';
export * from './lib/code-block-copy';
export * from './lib/code-block.token';
export * from './lib/code-block.types';

export const XuiCodeBlockImports = [XuiCodeBlock, XuiCodeBlockCopy] as const;
