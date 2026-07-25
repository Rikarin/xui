import { joinPathFragments, updateJson, type Tree } from '@nx/devkit';

/**
 * `@nx/angular:library` suppresses `nullishCoalescingNotNullable` and `optionalChainNotNullable` in
 * every tsconfig it writes. Both catch a redundant `??` or `?.` in a template — dead null handling
 * that reads as if a value could be absent when the types say it cannot. No package in the workspace
 * needs the escape hatch, so it comes back out before it can hide the first one.
 */
export function dropDiagnosticSuppressions(tree: Tree, projectRoot: string) {
  const configs = ['tsconfig.json', 'tsconfig.lib.json', 'tsconfig.lib.prod.json', 'tsconfig.spec.json'];

  for (const name of configs) {
    const path = joinPathFragments(projectRoot, name);

    if (!tree.exists(path)) {
      continue;
    }

    updateJson(tree, path, json => {
      const angularCompilerOptions = json.angularCompilerOptions as
        { extendedDiagnostics?: { checks?: Record<string, string> } } | undefined;
      const checks = angularCompilerOptions?.extendedDiagnostics?.checks;

      if (!checks) {
        return json;
      }

      delete checks['nullishCoalescingNotNullable'];
      delete checks['optionalChainNotNullable'];

      if (Object.keys(checks).length === 0) {
        delete angularCompilerOptions!.extendedDiagnostics!.checks;
      }

      if (Object.keys(angularCompilerOptions!.extendedDiagnostics!).length === 0) {
        delete angularCompilerOptions!.extendedDiagnostics;
      }

      if (Object.keys(angularCompilerOptions!).length === 0) {
        delete json.angularCompilerOptions;
      }

      return json;
    });
  }
}
