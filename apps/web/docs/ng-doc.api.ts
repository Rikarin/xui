import { NgDocApi } from '@ng-doc/core';

const api: NgDocApi = {
  title: 'API References',
  keyword: 'ApiReferences',
  scopes: [
    {
      name: '@xui/core',
      route: 'core',
      include: 'libs/xui/**/*.ts'
    }
  ]
};

export default api;
