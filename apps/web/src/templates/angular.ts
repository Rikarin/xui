import type { Project } from '@stackblitz/sdk';

const PACKAGE_JSON = {
  name: 'xui-example',
  version: '0.0.0',
  private: true,
  dependencies: {
    '@xui/components': 'latest',
    '@xui/theme-default': 'latest',

    luxon: '^3.4.4',
    '@types/luxon': '^3.3.7',

    '@angular/animations': '^16.0.0',
    '@angular/common': '^16.0.0',
    '@angular/compiler': '^16.0.0',
    '@angular/core': '^16.0.0',
    '@angular/forms': '^16.0.0',
    '@angular/platform-browser': '^16.0.0',
    '@angular/platform-browser-dynamic': '^16.0.0',
    '@angular/router': '^16.0.0',
    rxjs: '~7.8.0',
    tslib: '^2.3.0',
    'zone.js': '~0.13.0'
  },
  scripts: {
    ng: 'ng',
    start: 'ng serve',
    build: 'ng build',
    test: 'ng test',
    lint: 'ng lint',
    e2e: 'ng e2e'
  },
  devDependencies: {
    '@angular-devkit/build-angular': '^16.0.2',
    '@angular/cli': '~16.0.2',
    '@angular/compiler-cli': '^16.0.0',
    '@types/jasmine': '~4.3.0',
    'jasmine-core': '~4.6.0',
    karma: '~6.4.0',
    'karma-chrome-launcher': '~3.2.0',
    'karma-coverage': '~2.2.0',
    'karma-jasmine': '~5.1.0',
    'karma-jasmine-html-reporter': '~2.0.0',
    typescript: '~5.0.2'
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
            polyfills: ['zone.js'],
            tsConfig: 'tsconfig.app.json',
            inlineStyleLanguage: 'scss',
            assets: ['src/favicon.ico', 'src/assets'],
            styles: ['src/styles.scss'],
            scripts: []
          },
          configurations: {
            production: {
              budgets: [
                {
                  type: 'initial',
                  maximumWarning: '500kb',
                  maximumError: '1mb'
                },
                {
                  type: 'anyComponentStyle',
                  maximumWarning: '2kb',
                  maximumError: '4kb'
                }
              ],
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
        },
        'extract-i18n': {
          builder: '@angular-devkit/build-angular:extract-i18n',
          options: {
            browserTarget: 'test-xui:build'
          }
        },
        test: {
          builder: '@angular-devkit/build-angular:karma',
          options: {
            polyfills: ['zone.js', 'zone.js/testing'],
            tsConfig: 'tsconfig.spec.json',
            inlineStyleLanguage: 'scss',
            assets: ['src/favicon.ico', 'src/assets'],
            styles: ['src/styles.scss'],
            scripts: []
          }
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

const TSCONFIG_SPEC_JSON = {
  extends: './tsconfig.json',
  compilerOptions: {
    outDir: './out-tsc/spec',
    types: ['jasmine']
  },
  include: ['src/**/*.spec.ts', 'src/**/*.d.ts']
};

export const STYLE_SCSS = `@use '@xui/theme-default' as xui;
@use '@xui/theme-core' as core;

$primary: core.generate-palette(#0672a5);
$blue2: core.generate-palette(#0a628c);
$blue3: core.generate-palette(#0b4f71);
$primary-alt: core.generate-palette(#0c3e57);
$error: core.generate-palette(#a41e23);
$red-orange: core.generate-palette(#cb3927);
$secondary: core.generate-palette(#9c17a6);
$orange: core.generate-palette(#f18f23);
$yellow-orange: core.generate-palette(#f0b220);
$lime: core.generate-palette(#a3b34b);
$success: core.generate-palette(#108548);

$yellow: core.generate-palette(#f2bc18);
$green: core.generate-palette(#297a00);
$red: core.generate-palette(#cf005a);

$theme: core.define-dark-theme(
  (
    color: (
      primary: core.define-palette($primary),
      primary-alt: core.define-palette($primary-alt),
      secondary: core.define-palette($secondary),
      information: core.define-palette($blue2),
      success: core.define-palette($success),
      warn: core.define-palette($yellow-orange),
      destructive: core.define-palette($error),
      yellow: core.define-palette($yellow),
      red: core.define-palette($red),
      green: core.define-palette($green),
      blue: core.define-palette($primary),
    ),
  )
);

@include core.all-root-variables($theme);
@include xui.theme();
`;

const files: any = {
  'src/main.ts': `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\n\nimport { AppModule } from './app/app.module';\n\nplatformBrowserDynamic().bootstrapModule(AppModule).then(ref => {\n // Ensure Angular destroys itself on hot reloads.\n if ((window as any)['ngRef']) {\n (window as any)['ngRef'].destroy();\n }\n (window as any)['ngRef'] = ref;\n\n // Otherwise, log the boot error\n}).catch(err => console.error(err));`,
  'src/index.html': '<my-app>loading</my-app>',
  'src/app/app.component.ts':
    "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'my-app',\n  templateUrl: './app.component.html',\n  styleUrls: [ './app.component.scss' ]\n})\nexport class AppComponent  {\n  name = 'Angular';\n}\n",
  'src/app/app.component.scss': 'p {\n  font-family: Lato;\n}',
  'src/app/app.component.html': '{{SELECTORS}}'
};

files['package.json'] = JSON.stringify(PACKAGE_JSON, null, 2);
files['angular.json'] = JSON.stringify(ANGULAR_JSON, null, 2);
files['tsconfig.json'] = JSON.stringify(TSCONFIG_JSON, null, 2);
files['tsconfig.app.json'] = JSON.stringify(TSCONFIG_APP_JSON, null, 2);
files['tsconfig.spec.json'] = JSON.stringify(TSCONFIG_SPEC_JSON, null, 2);
files['src/styles.scss'] = STYLE_SCSS;

files['src/app/app.module.ts'] = `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import {
  XuiButtonModule,
  XuiCardModule,
  XuiContextMenuModule,
  XuiImageUploadModule,
  XuiInputModule,
  XuiLayoutModule,
  XuiMenuModule,
  XuiPanelBarModule,
  XuiPopoverModule,
  XuiRadioListModule,
  XuiSelectModule,
  XuiSettingsModule,
  XuiSnackbarModule,
  XuiTabModule,
  XuiTextareaModule,
  XuiTooltipModule,
  XuiConfigModule,
  XuiRadioModule,
  XuiDrawerModule,
  XuiBadgeComponent,
  XuiBannerComponent,
  XuiIconComponent,
  XuiProgressComponent,
  XuiCheckboxComponent,
  XuiSwitchComponent,
  XuiDecagramComponent,
  XuiSliderComponent,
  XuiSpinnerComponent,
  XuiDividerComponent,
  XuiToggleComponent,
  XuiStatusComponent,
  XuiDatePickerComponent,
  XuiTimePickerComponent,
  XuiGraphViewModule
} from '@xui/components';

{{IMPORTS}}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,

    XuiLayoutModule,
    XuiCardModule,
    XuiMenuModule,
    XuiButtonModule,
    XuiInputModule,
    XuiIconComponent,
    XuiProgressComponent,
    XuiSettingsModule,
    XuiTabModule,
    XuiContextMenuModule,
    XuiCheckboxComponent,
    XuiSwitchComponent,
    XuiImageUploadModule,
    XuiRadioListModule,
    XuiDecagramComponent,
    XuiTooltipModule,
    XuiSnackbarModule,
    XuiTextareaModule,
    XuiSelectModule,
    XuiSliderComponent,
    XuiSpinnerComponent,
    XuiDividerComponent,
    XuiToggleComponent,
    XuiStatusComponent,
    XuiDatePickerComponent,
    XuiTimePickerComponent,
    XuiPopoverModule,
    XuiPanelBarModule,
    XuiConfigModule,
    XuiRadioModule,
    XuiDrawerModule,
    XuiBadgeComponent,
    XuiBannerComponent,
    XuiGraphViewModule
  ],
  declarations: [ AppComponent, {{DECLARATIONS}} ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
`;


export const angularProject: Project = {
  title: 'xUI Components',
  description: 'This is an example of xUI components usage!',
  template: 'node',
  files,
  dependencies: PACKAGE_JSON.dependencies
};
