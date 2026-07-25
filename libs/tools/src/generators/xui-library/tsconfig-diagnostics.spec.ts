import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { dropDiagnosticSuppressions } from './tsconfig-diagnostics';

describe('dropDiagnosticSuppressions', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  const read = (path: string) => JSON.parse(tree.read(path, 'utf-8') ?? '{}');

  it('removes the whole block when the suppressions were all it held', () => {
    tree.write(
      'libs/ui/thing/xui/tsconfig.lib.json',
      JSON.stringify({
        extends: './tsconfig.json',
        angularCompilerOptions: {
          extendedDiagnostics: {
            checks: { nullishCoalescingNotNullable: 'suppress', optionalChainNotNullable: 'suppress' }
          }
        }
      })
    );

    dropDiagnosticSuppressions(tree, 'libs/ui/thing/xui');

    expect(read('libs/ui/thing/xui/tsconfig.lib.json')).toEqual({ extends: './tsconfig.json' });
  });

  it('keeps the other Angular compiler options around it', () => {
    tree.write(
      'libs/ui/thing/xui/tsconfig.lib.prod.json',
      JSON.stringify({
        angularCompilerOptions: {
          compilationMode: 'partial',
          extendedDiagnostics: {
            checks: { nullishCoalescingNotNullable: 'suppress', optionalChainNotNullable: 'suppress' }
          }
        }
      })
    );

    dropDiagnosticSuppressions(tree, 'libs/ui/thing/xui');

    expect(read('libs/ui/thing/xui/tsconfig.lib.prod.json')).toEqual({
      angularCompilerOptions: { compilationMode: 'partial' }
    });
  });

  it('leaves a check the workspace deliberately configured', () => {
    tree.write(
      'libs/ui/thing/xui/tsconfig.json',
      JSON.stringify({
        angularCompilerOptions: {
          extendedDiagnostics: {
            checks: { nullishCoalescingNotNullable: 'suppress', invalidBananaInBox: 'error' }
          }
        }
      })
    );

    dropDiagnosticSuppressions(tree, 'libs/ui/thing/xui');

    expect(read('libs/ui/thing/xui/tsconfig.json')).toEqual({
      angularCompilerOptions: { extendedDiagnostics: { checks: { invalidBananaInBox: 'error' } } }
    });
  });

  it('does nothing when there is no tsconfig to touch', () => {
    expect(() => dropDiagnosticSuppressions(tree, 'libs/ui/absent/xui')).not.toThrow();
  });
});
