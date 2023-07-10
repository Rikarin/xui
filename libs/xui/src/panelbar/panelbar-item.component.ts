import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnInit,
  Optional,
  SkipSelf,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Portal, TemplatePortal } from '@angular/cdk/portal';
import { PANEL_BAR_ACCESSOR, PanelBarAccessor, PanelBarItem } from './panelbar.types';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-panelbar-item',
  templateUrl: './panelbar-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelBarItemComponent implements OnInit {
  static ngAcceptInputType_expanded: BooleanInput;
  contentPortal?: Portal<unknown>;
  titlePortal?: Portal<unknown>;

  contentDirective?: TemplateRef<unknown>;
  titleDirective?: TemplateRef<unknown>;

  @Input() title!: string;
  @Input() content: any;
  @Input() icon?: string;
  @Input() iconClass?: string;
  @Input() expanded = false;

  @Input() _children?: PanelBarItem[];

  @ViewChild('contentTemplate', { static: true }) contentTemplate!: TemplateRef<unknown>;
  @ViewChild('titleTemplate', { static: true }) titleTemplate!: TemplateRef<unknown>;
  @ViewChild('contentRef', { static: true }) contentRef!: ElementRef;

  @HostBinding('class.x-panelbar-item')
  get hostMainClass(): boolean {
    return true;
  }

  get offset(): number {
    return this.parentItem ? this.parentItem.offset + 1 : 0;
  }

  get paddingLeft() {
    return 8 + this.offset * 24;
  }

  get hasContent() {
    return this.content ?? this._children ?? this.contentDirective ?? this.contentRef.nativeElement.children.length;
  }

  constructor(
    @Inject(PANEL_BAR_ACCESSOR) private panelBar: PanelBarAccessor,
    private viewContainerRef: ViewContainerRef,
    @Optional() @SkipSelf() private parentItem: PanelBarItemComponent
  ) {}

  ngOnInit() {
    const content = this.contentDirective ?? this.panelBar.itemTemplate ?? this.contentTemplate;
    this.contentPortal = new TemplatePortal(content, this.viewContainerRef, {
      $implicit: <PanelBarItem>{
        title: this.title,
        content: this.content
      }
    });

    const title = this.titleDirective ?? this.titleTemplate;
    this.titlePortal = new TemplatePortal(title, this.viewContainerRef, {
      $implicit: <PanelBarItem>{
        title: this.title,
        content: this.content
      }
    });
  }

  clickItem() {
    if (this.hasContent) {
      this.expanded = !this.expanded;
      // TODO; emit event
    } else {
      // TODO: emit click event?
    }
  }
}
