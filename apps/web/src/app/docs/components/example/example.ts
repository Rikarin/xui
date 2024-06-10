import { booleanAttribute, ChangeDetectionStrategy, Component, Inject, input, OnInit, signal } from '@angular/core';
import { XuiCardModule, XuiIcon, XuiTabModule, XuiTooltipModule } from '@xui/components';
import sdk, { Project, ProjectFiles } from '@stackblitz/sdk';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CommonModule, DOCUMENT } from '@angular/common';
import { angularProject } from '../../../../templates/angular';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    XuiCardModule,
    XuiTabModule,
    XuiTooltipModule,
    XuiIcon,
    HighlightModule,
    HighlightPlusModule,
    HighlightLineNumbers
  ],
  selector: 'app-example',
  templateUrl: 'example.html',
  styleUrls: ['example.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Example implements OnInit {
  content = signal<File[]>([]);

  files = input<Files>();
  todo = input(false, { transform: booleanAttribute });

  get project(): Project {
    return <Project>{
      ...angularProject,
      files: {
        ...this.injectedAngularFiles(this.content()),
        ...this.content().reduce(
          (obj, val) => {
            obj[val.path] = val.content;
            return obj;
          },
          <ProjectFiles>{}
        )
      }
    };
  }

  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document
  ) {}

  async ngOnInit() {
    this.content.set(await this.fetchFiles());
  }

  async fetchFiles() {
    const files: File[] = [];

    // TODO: finish this
    for (const file of Object.keys(this.files()!)) {
      if (this.files()![file] === FileType.Component) {
        const ts = await this.fetchFile(file, 'component.ts');
        const scss = await this.fetchFile(file, 'component.scss');
        const html = await this.fetchFile(file, 'component.html');

        const [className, selectorName] = this.extractNames(ts);
        ts.className = className;
        ts.selectorName = selectorName;

        files.push(ts);
        files.push(scss);
        files.push(html);
      }
    }

    return files;
  }

  private injectedAngularFiles(files: File[]) {
    const imports: string[] = [];
    const selectors: string[] = [];

    for (const file of files) {
      if (file.className) {
        const path = file.path.replace('src/', '').replace('.ts', '');
        imports.push(`import { ${file.className} } from './${path}';`);
      }

      if (file.selectorName) {
        selectors.push(`<${file.selectorName}></${file.selectorName}>`);
      }
    }

    const declarations = files
      .filter(x => x.className)
      .map(x => x.className)
      .join(', ');

    const ret = angularProject.files;
    ret['src/main.ts'] = ret['src/main.ts']
      .replace('{{SELECTORS}}', selectors.join('\n'))
      .replace('{{IMPORTS}}', imports.join('\n'))
      .replace('{{DECLARATIONS}}', declarations);

    return ret;
  }

  private extractNames(file: File) {
    const className = file.content.match(/export class (\w+)/);
    const selectorName = file.content.match(/selector: '([\w-]+)'/);

    return [className![1], selectorName![1]];
  }

  private async fetchFile(name: string, postfix: string): Promise<File> {
    const content = await lastValueFrom(
      this.http.get<string>(`/examples/${name}/${name}.${postfix}`, { responseType: 'text' as 'json' })
    );

    return <File>{
      name: `${postfix}`,
      path: `src/app/examples/${name}/${name}.${postfix}`,
      fullPath: `${this.document.location.origin}/examples/${name}/${name}.${postfix}`,
      content
    };
  }

  openProject() {
    sdk.openProject(this.project, {
      newWindow: true,
      openFile: this.content()
        .map(x => x.path)
        .join(',')
    });
  }

  // async embedProject() {
  //   await sdk.embedProject(this.id, this.project, {
  //     height: 600,
  //     view: 'editor',
  //     openFile: this.getFileNames(),
  //     // openFile: 'index.js,index.html',
  //     terminalHeight: 50
  //   });
  // }

  // private generateId() {
  //   const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  //   let text = '';
  //   for (let i = 0; i < 128; i++) {
  //     text += possible.charAt(Math.floor(Math.random() * possible.length));
  //   }
  //
  //   return text;
  // }

  getFileType(file: File): string {
    if (file.path.endsWith('html')) {
      return 'html';
    }

    if (file.path.endsWith('scss')) {
      return 'scss';
    }

    return 'typescript';
  }
}

interface File {
  name: string;
  path: string;
  content: string;

  className?: string;
  selectorName?: string;
}

export enum FileType {
  Source,
  Component
}

interface Files {
  [name: string]: FileType;
}
