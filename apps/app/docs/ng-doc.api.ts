import { NgDocApi } from '@ng-doc/core';

const api: NgDocApi = {
  title: 'API References',
  keyword: 'ApiReferences',
  scopes: [
    // Core
    {
      name: '@xui/core',
      route: 'core',
      include: 'libs/core/src/*.ts'
    },
    {
      name: '@xui/core/checkbox',
      route: 'core/checkbox',
      include: 'libs/core/checkbox/src/*.ts'
    },
    {
      name: '@xui/core/forms',
      route: 'core/forms',
      include: 'libs/core/forms/src/*.ts'
    },

    // UI
    {
      name: '@xui/badge',
      route: 'badge',
      include: 'libs/ui/badge/xui/src/*.ts'
    },
    {
      name: '@xui/button',
      route: 'button',
      include: 'libs/ui/button/xui/src/*.ts'
    },
    {
      name: '@xui/button-group',
      route: 'button-group',
      include: 'libs/ui/button-group/xui/src/*.ts'
    },
    {
      name: '@xui/checkbox',
      route: 'checkbox',
      include: 'libs/ui/checkbox/xui/src/*.ts'
    },
    {
      name: '@xui/icon',
      route: 'icon',
      include: 'libs/ui/icon/xui/src/*.ts'
    }
  ]
};

export default api;
