import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { createWindow } from 'domino';

const distFolder = join(process.cwd(), 'dist/apps/web/browser');
const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

const template = readFileSync(join(distFolder, 'index.html')).toString();
const win = createWindow(template);
(global.window as any) = win;
global.document = win.document;

export * from './app/app.module';
