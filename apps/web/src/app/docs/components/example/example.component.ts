import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { InputBoolean } from '@xui/components';
import sdk, { Project, ProjectFiles } from '@stackblitz/sdk';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import { angularProject } from '../../../../templates/angular';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent implements OnInit {
  static ngAcceptInputType_todo: BooleanInput;
  allFiles$ = new BehaviorSubject<File[]>([]);

  @Input() files: { [name: string]: FileType } = {};
  @Input() @InputBoolean() todo = false;

  get project(): Project {
    return <Project>{
      ...angularProject,
      files: {
        ...angularProject.files,
        ...this.allFiles$.value.reduce((obj, val) => {
          obj[val.path] = val.content;
          return obj;
        }, <ProjectFiles>{})
      }
    };
  }

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  async ngOnInit() {
    this.allFiles$.next(await this.fetchFiles());
  }

  async fetchFiles() {
    const ret: File[] = [];

    // TODO: finish this
    for (const file of Object.keys(this.files)) {
      if (this.files[file] === FileType.Component) {
        await this.fetchFile(file, 'component.ts', ret);
        await this.fetchFile(file, 'component.scss', ret);
        await this.fetchFile(file, 'component.html', ret);
      }
    }

    return ret;
  }

  private async fetchFile(name: string, postfix: string, list: File[]) {
    const content = await lastValueFrom(
      this.http.get<string>(`/examples/${name}/${name}.${postfix}`, { responseType: 'text' as 'json' })
    );

    list.push(<File>{
      name: `${postfix}`,
      path: `src/app/examples/${name}/${name}.${postfix}`,
      fullPath: `${this.document.location.origin}/examples/${name}/${name}.${postfix}`,
      content
    });
  }

  openProject() {
    sdk.openProject(this.project, {
      newWindow: true,
      openFile: this.allFiles$.value.map(x => x.path).join(',')
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
}

interface File {
  name: string;
  path: string;
  content: string;
}

export enum FileType {
  Source,
  Component
}
