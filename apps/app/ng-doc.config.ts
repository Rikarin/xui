import { NgDocConfiguration } from '@ng-doc/builder';
import { ngKeywordsLoader, rxjsKeywordsLoader } from '@ng-doc/keywords-loaders';

const config: NgDocConfiguration = {
  docsPath: 'apps/app/docs',
  // routePrefix: 'docs',
  tsConfig: 'apps/app/tsconfig.app.json',
  cache: true,
  repoConfig: {
    url: 'https://github.com/rikarin/xui',
    mainBranch: 'master',
    releaseBranch: 'master'
  },
  keywords: {
    loaders: [ngKeywordsLoader(), rxjsKeywordsLoader()]
  }
};

export default config;
