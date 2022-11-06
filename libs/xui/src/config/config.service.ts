import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, mapTo } from 'rxjs/operators';
import { XuiConfig, XUI_CONFIG } from './config';

export type XuiConfigKey = keyof XuiConfig;

const isDefined = function (value?: any): boolean {
  return value !== undefined;
};

@Injectable({
  providedIn: 'root'
})
export class XuiConfigService {
  private configUpdated$ = new Subject<XuiConfigKey>();
  private config: XuiConfig;

  constructor(@Optional() @Inject(XUI_CONFIG) defaultConfig?: XuiConfig) {
    this.config = defaultConfig || {};
  }

  getConfigForComponent<T extends XuiConfigKey>(componentName: T): XuiConfig[T] {
    return this.config[componentName];
  }

  getConfigChangeEventForComponent(componentName: XuiConfigKey): Observable<void> {
    return this.configUpdated$.pipe(
      filter(n => n === componentName),
      mapTo(undefined)
    );
  }

  set<T extends XuiConfigKey>(componentName: T, value: XuiConfig[T]): void {
    this.config[componentName] = { ...this.config[componentName], ...value };
    this.configUpdated$.next(componentName);
  }
}

export function WithConfig<T>() {
  return function ConfigDecorator(target: any, propName: any, originalDescriptor?: TypedPropertyDescriptor<T>): any {
    const privatePropName = `$$__assignedValue__${propName}`;

    Object.defineProperty(target, privatePropName, {
      configurable: true,
      writable: true,
      enumerable: false
    });

    return {
      get(): T | undefined {
        const originalValue = originalDescriptor?.get ? originalDescriptor.get.bind(this)() : this[privatePropName];
        const assignedByUser = ((this.assignmentCount || {})[propName] || 0) > 1;

        if (assignedByUser && isDefined(originalValue)) {
          return originalValue;
        }

        const componentConfig = this.nzConfigService.getConfigForComponent(this._nzModuleName) || {};
        const configValue = componentConfig[propName];
        const ret = isDefined(configValue) ? configValue : originalValue;

        return ret;
      },
      set(value?: T): void {
        // If the value is assigned, we consider the newly assigned value as 'assigned by user'.
        this.assignmentCount = this.assignmentCount || {};
        this.assignmentCount[propName] = (this.assignmentCount[propName] || 0) + 1;

        if (originalDescriptor?.set) {
          originalDescriptor.set.bind(this)(value);
        } else {
          this[privatePropName] = value;
        }
      },
      configurable: true,
      enumerable: true
    };
  };
}
