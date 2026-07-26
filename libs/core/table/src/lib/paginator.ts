import {
  Directive,
  Input,
  type OnInit,
  type Signal,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  numberAttribute,
  signal,
  untracked
} from '@angular/core';

export type XPaginatorState = {
  currentPage: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  totalPages: number;
  totalElements: number | null | undefined;
};

export type XPaginatorContext = {
  $implicit: {
    state: Signal<XPaginatorState>;
    incrementable: Signal<boolean>;
    decrementable: Signal<boolean>;
    increment: () => void;
    decrement: () => void;
    goToFirstPage: () => void;
    goToLastPage: () => void;
  };
};

@Directive({
  selector: '[xPaginator]',
  exportAs: 'xPaginator'
})
export class XPaginator implements OnInit {
  static ngTemplateContextGuard(_directive: XPaginator, _context: unknown): _context is XPaginatorContext {
    return true;
  }

  private readonly vcr = inject(ViewContainerRef);
  private readonly template = inject(TemplateRef<unknown>);

  private readonly state = signal<XPaginatorState>({
    currentPage: 0,
    startIndex: 0,
    endIndex: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: null
  });
  private readonly decrementable = computed(() => 0 < this.state().startIndex);
  private readonly incrementable = computed(() => this.state().endIndex < (this.state().totalElements ?? 0) - 1);

  @Input({ alias: 'xPaginatorTotalElements' })
  set totalElements(value: number | null | undefined) {
    this.calculateNewState({ newTotalElements: value, newPage: 0 });
  }

  @Input({ alias: 'xPaginatorCurrentPage', transform: numberAttribute })
  set currentPage(value: number) {
    this.calculateNewState({ newPage: value });
  }

  @Input({ alias: 'xPaginatorPageSize', transform: numberAttribute })
  set pageSize(value: number) {
    this.calculateNewState({ newPageSize: value, newPage: 0 });
  }

  @Input({ alias: 'xPaginatorOnStateChange' })
  onStateChange?: (state: XPaginatorState) => void;

  constructor() {
    effect(() => {
      const state = this.state();
      untracked(() => {
        Promise.resolve().then(() => {
          if (this.onStateChange) {
            this.onStateChange(state);
          }
        });
      });
    });
  }

  ngOnInit() {
    this.vcr.createEmbeddedView<XPaginatorContext>(this.template, {
      $implicit: {
        state: this.state,
        increment: () => this.incrementPage(),
        decrement: () => this.decrementPage(),
        incrementable: this.incrementable,
        decrementable: this.decrementable,
        goToFirstPage: () => this.reset(),
        goToLastPage: () => this.goToLastPage()
      }
    });
  }

  goToLastPage(): void {
    this.currentPage = this.state().totalPages;
  }

  decrementPage(): void {
    const { currentPage } = this.state();
    if (0 < currentPage) {
      this.calculateNewState({ newPage: currentPage - 1 });
    }
  }

  incrementPage(): void {
    const { currentPage, totalPages } = this.state();
    if (totalPages > currentPage) {
      this.calculateNewState({ newPage: currentPage + 1 });
    }
  }

  reset(): void {
    this.currentPage = 0;
  }

  private calculateNewState({
    newPage,
    newPageSize,
    newTotalElements
  }: Partial<{
    newPage: number;
    newPageSize: number;
    newTotalElements: number | null | undefined;
  }>) {
    const previousState = this.state();

    let currentPage = newPage ?? previousState.currentPage;
    const pageSize = newPageSize ?? previousState.pageSize;
    const totalElements = newTotalElements ?? previousState.totalElements ?? 0;

    const newTotalPages = totalElements ? Math.floor(totalElements / pageSize) : 0;

    if (newTotalPages < currentPage - 1) {
      currentPage = newTotalPages - 1;
    }

    const newStartIndex = totalElements === 0 ? 0 : Math.min(totalElements - 1, currentPage * pageSize);
    const newEndIndex = Math.min((currentPage + 1) * pageSize - 1, totalElements - 1);

    const newState = {
      currentPage: currentPage,
      startIndex: newStartIndex,
      endIndex: newEndIndex,
      pageSize: pageSize,
      totalPages: newTotalPages,
      totalElements: totalElements
    };

    this.state.set(newState);
  }
}
