import {
  Directive,
  type OnInit,
  type Signal,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output
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

  readonly totalElements = input<number | null | undefined>(null, { alias: 'xPaginatorTotalElements' });
  readonly currentPage = input(0, { alias: 'xPaginatorCurrentPage', transform: numberAttribute });
  readonly pageSize = input(10, { alias: 'xPaginatorPageSize', transform: numberAttribute });

  readonly stateChange = output<XPaginatorState>({ alias: 'xPaginatorStateChange' });

  // The page the paginator is on: follows the `currentPage` input, resets to
  // the first page when the data set or the page size changes, and is written
  // locally by increment/decrement/goTo… navigation.
  private readonly page = linkedSignal<
    { totalElements: number | null | undefined; pageSize: number; currentPage: number },
    number
  >({
    source: () => ({
      totalElements: this.totalElements(),
      pageSize: this.pageSize(),
      currentPage: this.currentPage()
    }),
    computation: (source, previous) => {
      if (!previous || source.currentPage !== previous.source.currentPage) {
        return source.currentPage;
      }
      // totalElements or pageSize changed — back to the first page.
      return 0;
    }
  });

  private readonly state: Signal<XPaginatorState> = computed(() => {
    const totalElements = this.totalElements() ?? 0;
    const pageSize = this.pageSize();
    let currentPage = this.page();

    const totalPages = totalElements ? Math.floor(totalElements / pageSize) : 0;

    if (totalPages < currentPage - 1) {
      currentPage = totalPages - 1;
    }

    return {
      currentPage,
      startIndex: totalElements === 0 ? 0 : Math.min(totalElements - 1, currentPage * pageSize),
      endIndex: Math.min((currentPage + 1) * pageSize - 1, totalElements - 1),
      pageSize,
      totalPages,
      totalElements
    };
  });

  private readonly decrementable = computed(() => 0 < this.state().startIndex);
  private readonly incrementable = computed(() => this.state().endIndex < (this.state().totalElements ?? 0) - 1);

  constructor() {
    effect(() => this.stateChange.emit(this.state()));
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
    this.page.set(this.state().totalPages);
  }

  decrementPage(): void {
    const { currentPage } = this.state();
    if (0 < currentPage) {
      this.page.set(currentPage - 1);
    }
  }

  incrementPage(): void {
    const { currentPage, totalPages } = this.state();
    if (totalPages > currentPage) {
      this.page.set(currentPage + 1);
    }
  }

  reset(): void {
    this.page.set(0);
  }
}
