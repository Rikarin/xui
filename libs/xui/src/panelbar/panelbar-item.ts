import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  Inject,
  input,
  Optional,
  signal,
  SkipSelf,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { PANEL_BAR_ACCESSOR, PanelBarAccessor, PanelBarItem } from './panelbar.types';
import { convertToBoolean } from '../utils';

@Component({
  selector: 'xui-panelbar-item',
  templateUrl: 'panelbar-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'x-panelbar-item'
  }
})
export class XuiPanelBarItem {
  _contentDirective?: TemplateRef<unknown>;
  _titleDirective?: TemplateRef<unknown>;
  _expanded = signal(false);

  title = input<string>();
  content = input<any>();
  icon = input<string>();
  iconClass = input<string>();
  expanded = input(false, { transform: (v: string | boolean) => convertToBoolean(v) });
  _children = input<PanelBarItem[]>();

  @ViewChild('contentTemplate', { static: true }) private contentTemplate!: TemplateRef<unknown>;
  @ViewChild('titleTemplate', { static: true }) private titleTemplate!: TemplateRef<unknown>;
  @ViewChild('contentRef', { static: true }) private contentRef!: ElementRef;

  _contentPortal = computed(() => {
    const content = this._contentDirective ?? this.panelBar._itemTemplate ?? this.contentTemplate;
    return new TemplatePortal(content, this.viewContainerRef, {
      $implicit: <PanelBarItem>{
        title: this.title(),
        content: this.content()
      }
    });
  });

  _titlePortal = computed(() => {
    const title = this._titleDirective ?? this.titleTemplate;
    return new TemplatePortal(title, this.viewContainerRef, {
      $implicit: <PanelBarItem>{
        title: this.title(),
        content: this.content()
      }
    });
  });

  _hasContent = computed(
    () => this.content() ?? this._children() ?? this._contentDirective ?? this.contentRef.nativeElement.children.length
  );

  private get offset(): number {
    return this.parentItem ? this.parentItem.offset + 1 : 0;
  }

  get _paddingLeft() {
    return 8 + this.offset * 24;
  }

  constructor(
    @Inject(PANEL_BAR_ACCESSOR) private panelBar: PanelBarAccessor,
    private viewContainerRef: ViewContainerRef,
    @Optional() @SkipSelf() private parentItem: XuiPanelBarItem
  ) {}

  clickItem() {
    if (this._hasContent()) {
      this._expanded.set(!this._expanded());
      // TODO; emit event
    } else {
      // TODO: emit click event?
    }
  }
}
