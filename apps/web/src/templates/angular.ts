import type { Project } from '@stackblitz/sdk';

const PACKAGE_JSON = {
  name: 'xui-example',
  version: '0.0.0',
  private: true,
  dependencies: {
    '@xui/components': 'latest',
    '@xui/theme-default': 'latest',

    luxon: '^3.4.0',
    '@types/luxon': '^3.4.0',

    "@angular/animations": "^18.0.0",
    "@angular/common": "^18.0.0",
    "@angular/compiler": "^18.0.0",
    "@angular/core": "^18.0.0",
    "@angular/forms": "^18.0.0",
    "@angular/platform-browser": "^18.0.0",
    '@angular/platform-browser-dynamic': '^18.0.0',
    "@angular/router": "^18.0.0",
    rxjs: '~7.8.1',
    tslib: '^2.5.0',
    'zone.js': '~0.14.0'
  },
  scripts: {
    ng: 'ng',
    start: 'ng serve',
    build: 'ng build'
  },
  devDependencies: {
    "@angular-devkit/build-angular": "^18.0.0",
    "@angular/cli": "^18.0.1",
    "@angular/compiler-cli": "^18.0.0",
    "typescript": "~5.4.0"
  }
};

const ANGULAR_JSON = {
  $schema: './node_modules/@angular/cli/lib/config/schema.json',
  version: 1,
  newProjectRoot: 'projects',
  projects: {
    'test-xui': {
      projectType: 'application',
      schematics: {
        '@schematics/angular:component': {
          style: 'scss'
        }
      },
      root: '',
      sourceRoot: 'src',
      prefix: 'app',
      architect: {
        build: {
          builder: '@angular-devkit/build-angular:browser',
          options: {
            outputPath: 'dist/test-xui',
            index: 'src/index.html',
            main: 'src/main.ts',
            tsConfig: 'tsconfig.app.json',
            inlineStyleLanguage: 'scss',
            assets: [],
            styles: ['src/styles.scss'],
            scripts: []
          },
          configurations: {
            production: {
              outputHashing: 'all'
            },
            development: {
              buildOptimizer: false,
              optimization: false,
              vendorChunk: true,
              extractLicenses: false,
              sourceMap: true,
              namedChunks: true
            }
          },
          defaultConfiguration: 'production'
        },
        serve: {
          builder: '@angular-devkit/build-angular:dev-server',
          configurations: {
            production: {
              browserTarget: 'test-xui:build:production'
            },
            development: {
              browserTarget: 'test-xui:build:development'
            }
          },
          defaultConfiguration: 'development'
        }
      }
    }
  }
};

const TSCONFIG_JSON = {
  compileOnSave: false,
  compilerOptions: {
    baseUrl: './',
    outDir: './dist/out-tsc',
    forceConsistentCasingInFileNames: true,
    strict: true,
    noImplicitOverride: true,
    noPropertyAccessFromIndexSignature: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    sourceMap: true,
    declaration: false,
    downlevelIteration: true,
    experimentalDecorators: true,
    moduleResolution: 'node',
    importHelpers: true,
    target: 'ES2022',
    module: 'ES2022',
    useDefineForClassFields: false,
    lib: ['ES2022', 'dom']
  },
  angularCompilerOptions: {
    enableI18nLegacyMessageIdFormat: false,
    strictInjectionParameters: true,
    strictInputAccessModifiers: true,
    strictTemplates: true
  }
};

const TSCONFIG_APP_JSON = {
  extends: './tsconfig.json',
  compilerOptions: {
    outDir: './out-tsc/app',
    types: []
  },
  files: ['src/main.ts'],
  include: ['src/**/*.d.ts']
};

export const STYLE_SCSS = `@use '@xui/theme-default' as xui;
@use '@xui/theme-core' as core;

$theme: core.define-dark-theme(
  (
    color: (
      primary: core.define-palette(core.generate-palette(55.88% 0.154 252.84)),
      primary-alt: core.define-palette(core.$purple-palette),
      secondary: core.define-palette(core.$orange-palette)
    )
  )
);

@include core.all-root-variables($theme);
@include core.typography-default-font();
@include xui.theme();
`;

const files: any = { };

files['src/index.html'] = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <title>My app</title>
      <meta charset="UTF-8" />
    </head>
    <body>
      <app-root>Loading...</app-root>
    </body>
  </html>
`;

files['src/main.ts'] = `import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';

{{IMPORTS}}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [{{DECLARATIONS}}],
  template: \`{{SELECTORS}}\`
})
export class App {
  name = 'Angular';
}

bootstrapApplication(App);
`;

files['package.json'] = JSON.stringify(PACKAGE_JSON, null, 2);
files['angular.json'] = JSON.stringify(ANGULAR_JSON, null, 2);
files['tsconfig.json'] = JSON.stringify(TSCONFIG_JSON, null, 2);
files['tsconfig.app.json'] = JSON.stringify(TSCONFIG_APP_JSON, null, 2);
files['src/styles.scss'] = STYLE_SCSS;

export const angularProject: Project = {
  title: 'xUI Components',
  description: 'This is an example of xUI components usage!',
  template: 'node',
  files,
  dependencies: PACKAGE_JSON.dependencies
};
