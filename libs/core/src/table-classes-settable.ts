import { createInjectionToken } from './create-injection-token';

export interface XTableClassesSettable {
  setTableClasses: (classes: Partial<{ table: string; headerRow: string; bodyRow: string }>) => void;
}

export const [
  injectXTableClassesSettable,
  provideXTableClassesSettable,
  provideXTableClassesSettableExisting,
  SET_TABLE_CLASSES_TOKEN
] = createInjectionToken<XTableClassesSettable>('@xui SET_TABLE_CLASSES_TOKEN');
