import { Component, Input } from '@angular/core';
import { InputBoolean } from 'xui';
import sdk, { Project } from '@stackblitz/sdk';
import packageInfo from '../../../../../../package.json';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {
  @Input() files: { [name: string]: string } = {};
  @Input() @InputBoolean() todo = false;

  id = this.generateId();

  minimalFiles = {
    'src/main.ts': `import './polyfills';\n\nimport { enableProdMode } from '@angular/core';\nimport { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\n\nimport { AppModule } from './app/app.module';\n\nplatformBrowserDynamic().bootstrapModule(AppModule).then(ref => {\n  // Ensure Angular destroys itself on hot reloads.\n  if (window['ngRef']) {\n    window['ngRef'].destroy();\n  }\n  window['ngRef'] = ref;\n\n  // Otherwise, log the boot error\n}).catch(err => console.error(err));`,
    'angular.json': `{\n  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",\n  "version": 1,\n  "newProjectRoot": "projects",\n  "projects": {\n    "demo": {\n      "root": "",\n      "sourceRoot": "src",\n      "projectType": "application",\n      "prefix": "app",\n      "schematics": {},\n      "architect": {\n        "build": {\n          "builder": "@angular-devkit/build-angular:browser",\n          "options": {\n            "outputPath": "dist/demo",\n            "index": "src/index.html",\n            "main": "src/main.ts",\n            "polyfills": "src/polyfills.ts",\n            "tsConfig": "src/tsconfig.app.json",\n            "assets": [\n              "src/favicon.ico",\n              "src/assets"\n            ],\n            "styles": [\n              "src/styles.scss"\n            ],\n            "scripts": []\n          },\n          "configurations": {\n            "production": {\n              "fileReplacements": [\n                {\n                  "replace": "src/environments/environment.ts",\n                  "with": "src/environments/environment.prod.ts"\n                }\n              ],\n              "optimization": true,\n              "outputHashing": "all",\n              "sourceMap": false,\n              "extractCss": true,\n              "namedChunks": false,\n              "aot": true,\n              "extractLicenses": true,\n              "vendorChunk": false,\n              "buildOptimizer": true\n            }\n          }\n        },\n        "serve": {\n          "builder": "@angular-devkit/build-angular:dev-server",\n          "options": {\n            "browserTarget": "demo:build"\n          },\n          "configurations": {\n            "production": {\n              "browserTarget": "demo:build:production"\n            }\n          }\n        },\n        "extract-i18n": {\n          "builder": "@angular-devkit/build-angular:extract-i18n",\n          "options": {\n            "browserTarget": "demo:build"\n          }\n        },\n        "test": {\n          "builder": "@angular-devkit/build-angular:karma",\n          "options": {\n            "main": "src/test.ts",\n            "polyfills": "src/polyfills.ts",\n            "tsConfig": "src/tsconfig.spec.json",\n            "karmaConfig": "src/karma.conf.js",\n            "styles": [\n              "styles.scss"\n            ],\n            "scripts": [],\n            "assets": [\n              "src/favicon.ico",\n              "src/assets"\n            ]\n          }\n        },\n        "lint": {\n          "builder": "@angular-devkit/build-angular:tslint",\n          "options": {\n            "tsConfig": [\n              "src/tsconfig.app.json",\n              "src/tsconfig.spec.json"\n            ],\n            "exclude": [\n              "**/node_modules/**"\n            ]\n          }\n        }\n      }\n    }\n  },\n  "defaultProject": "demo"\n}`,
    'tsconfig.json':
      '{\n  "compileOnSave": false,\n  "compilerOptions": {\n    "baseUrl": "./",\n    "outDir": "./dist/out-tsc",\n    "sourceMap": true,\n    "declaration": false,\n    "downlevelIteration": true,\n    "experimentalDecorators": true,\n    "module": "esnext",\n    "moduleResolution": "node",\n    "importHelpers": true,\n    "target": "es2020",\n    "typeRoots": [\n      "node_modules/@types"\n    ],\n    "lib": [\n      "es2018",\n      "dom"\n    ]\n  },\n  "angularCompilerOptions": {\n    "enableIvy": false,\n    "fullTemplateTypeCheck": true,\n    "strictInjectionParameters": true\n  }\n}',
    'src/index.html': '<my-app>loading</my-app>',
    'src/styles.scss': '',
    'src/polyfills.ts':
      "/**\n * This file includes polyfills needed by Angular and is loaded before the app.\n * You can add your own extra polyfills to this file.\n *\n * This file is divided into 2 sections:\n *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.\n *   2. Application imports. Files imported after ZoneJS that should be loaded before your main\n *      file.\n *\n * The current setup is for so-called \"evergreen\" browsers; the last versions of browsers that\n * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),\n * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.\n *\n * Learn more in https://angular.io/docs/ts/latest/guide/browser-support.html\n */\n\n/***************************************************************************************************\n * BROWSER POLYFILLS\n */\n\n/** IE9, IE10 and IE11 requires all of the following polyfills. **/\n// import 'core-js/es6/symbol';\n// import 'core-js/es6/object';\n// import 'core-js/es6/function';\n// import 'core-js/es6/parse-int';\n// import 'core-js/es6/parse-float';\n// import 'core-js/es6/number';\n// import 'core-js/es6/math';\n// import 'core-js/es6/string';\n// import 'core-js/es6/date';\n// import 'core-js/es6/array';\n// import 'core-js/es6/regexp';\n// import 'core-js/es6/map';\n// import 'core-js/es6/set';\n\n/** IE10 and IE11 requires the following for NgClass support on SVG elements */\n// import 'classlist.js';  // Run `npm install --save classlist.js`.\n\n/** IE10 and IE11 requires the following to support `@angular/animation`. */\n// import 'web-animations-js';  // Run `npm install --save web-animations-js`.\n\n\n/** Evergreen browsers require these. **/\n// import 'core-js/es6/reflect';\n// import 'core-js/es7/reflect';\n\n\n/**\n * Web Animations `@angular/platform-browser/animations`\n * Only required if AnimationBuilder is used within the application and using IE/Edge or Safari.\n * Standard animation support in Angular DOES NOT require any polyfills (as of Angular 6.0).\n */\n// import 'web-animations-js';  // Run `npm install --save web-animations-js`.\n\n\n\n/***************************************************************************************************\n * Zone JS is required by Angular itself.\n */\nimport 'zone.js/dist/zone';  // Included with Angular CLI.\n\n\n/***************************************************************************************************\n * APPLICATION IMPORTS\n */\n\n/**\n * Date, currency, decimal and percent pipes.\n * Needed for: All but Chrome, Firefox, Edge, IE11 and Safari 10\n */\n// import 'intl';  // Run `npm install --save intl`.",
    'src/app/app.module.ts':
      "import { NgModule } from '@angular/core';\nimport { BrowserModule } from '@angular/platform-browser';\nimport { FormsModule } from '@angular/forms';\n\nimport { AppComponent } from './app.component';\n\n@NgModule({\n  imports:      [ BrowserModule, FormsModule ],\n  declarations: [ AppComponent ],\n  bootstrap:    [ AppComponent ]\n})\nexport class AppModule { }\n",
    'src/app/app.component.ts':
      "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'my-app',\n  templateUrl: './app.component.html',\n  styleUrls: [ './app.component.scss' ]\n})\nexport class AppComponent  {\n  name = 'Angular';\n}\n",
    'src/app/app.component.scss': 'p {\n  font-family: Lato;\n}',
    'src/app/app.component.html': '<p>\n  Start editing to see some magic happen :)\n</p>'
  };

  get project(): Project {
    return {
      template: 'angular-cli',
      title: `xUI Components - Foo Bar`,
      description: `This is an example of xUI components usage!`,
      dependencies: {
        xui: packageInfo.version
      },
      files: {
        ...this.minimalFiles,
        ...this.files
      }
    };
  }

  openProject() {
    sdk.openProject(this.project, {
      newWindow: true,
      openFile: this.getFileNames()
    });
  }

  async embedProject() {
    await sdk.embedProject(this.id, this.project, {
      height: 600,
      view: 'editor',
      openFile: this.getFileNames(),
      // openFile: 'index.js,index.html',
      terminalHeight: 50
    });
  }

  private getFileNames() {
    return Object.keys(this.files ?? {}).join(',');
  }

  private generateId() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let text = '';
    for (let i = 0; i < 128; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}
