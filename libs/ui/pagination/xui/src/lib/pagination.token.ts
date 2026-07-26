import { createXConfigToken } from '@xui/core';

/**
 * Application-wide defaults for XuiPagination.
 *
 * Provide it once at the app root to change every pagination bar without
 * touching call sites; individual inputs still override the configured value.
 */
export interface XuiPaginationConfig {
  /** Pages shown on each side of the current page. */
  siblingCount: number;
  /** Choices offered by the size changer. */
  pageSizeOptions: number[];
  /** Render the page-size `<select>` by default. */
  showSizeChanger: boolean;
  /** Render the item-count summary by default. */
  showTotal: boolean;
  /** Collapse the numbered pages to a `current / total` readout. */
  simple: boolean;
}

export const [injectXuiPaginationConfig, provideXuiPaginationConfig] = createXConfigToken<XuiPaginationConfig>(
  'XuiPaginationConfig',
  {
    siblingCount: 1,
    pageSizeOptions: [10, 20, 50, 100],
    showSizeChanger: false,
    showTotal: false,
    simple: false
  }
);
