# Releasing

Every publishable package shares one version (a fixed release group): `@xui/core`, the 90
`@xui/<component>` packages, `@xui/tools` and `@xui/mcp`. `libs/testing`, the docs app and
Storybook are not published.

## How a release happens

Pushing to `develop` runs [`.github/workflows/release.yml`](../.github/workflows/release.yml),
which:

1. **Decides whether there is anything to release** - it looks for a `feat`, `fix`, `perf`,
   `revert` or breaking-change commit since the last `v*` tag. Anything else (docs, chore,
   refactor, test) is not a release on its own, and the run stops.
2. **Verifies the workspace** - `nx run-many -t lint test`.
3. **Versions** - `nx release` builds every package, resolves the current version from the latest
   `v*` tag, and writes the new one into both the source and the `dist` manifests, so the artifacts
   that get published carry the version that was just tagged.
4. **Writes the changelog**, commits `chore(release): publish <version> [skip ci]`, tags, pushes and
   creates the GitHub Release.
5. **Publishes to npm** with provenance, under the dist-tag that matches the version.

`develop` is the release line: every v2 tag was cut from it, while `master` still holds the 1.x
tree. If that changes, update the branch in `release.yml`.

## Version bumps

While the version is a prerelease, each release continues the prerelease line automatically:
`2.0.0-alpha.8` → `2.0.0-alpha.9`. Once the version is stable, the conventional commits decide
between patch, minor and major.

Graduating out of the alpha line is deliberate: run the **Release** workflow manually
(Actions → Release → Run workflow) with an explicit `specifier`:

| Specifier    | Result from `2.0.0-alpha.9` |
| ------------ | --------------------------- |
| `prerelease` | `2.0.0-alpha.10`            |
| `2.0.0`      | `2.0.0`                     |
| `minor`      | `2.1.0`                     |

The same dialog has a `dryRun` toggle that runs the whole pipeline without tagging, pushing or
publishing.

## npm dist-tags

- A version with a prerelease part (`2.0.0-alpha.9`) publishes under **`next`**.
- A stable version publishes under **`latest`**.

So `pnpm add @xui/button` gets the newest stable release, and `pnpm add @xui/button@next` gets the
current alpha. `latest` currently still points at `2.0.0-alpha.8`, the last alpha published before
this rule existed; it moves to a stable version on the first non-prerelease release.

## Commit messages are the release input

Commits are Conventional Commits, checked by commitlint in three places: the `commit-msg` git hook
(installed by the `prepare` script on `pnpm install`), the `Commit messages` CI job on every pull
request, and implicitly by the release itself, which reads them to decide the bump and the
changelog. A `chore:` commit ships nothing.

Scopes must come from the `scope-enum` list in `commitlint.config.mjs`, and are optional.

## Releasing by hand

Rarely needed - the workflow above is the supported path. If you must:

```bash
pnpm release:dry-run                 # preview: versions, changelog, tag
pnpm release prerelease --preid alpha  # version, changelog, commit, tag, push
```

`pnpm release` **pushes** the commit and tag. The
[Publish workflow](../.github/workflows/publish.yaml) then picks the tag up, re-verifies that the
tag matches the workspace version, rebuilds and publishes. It can also be run manually from the
Actions tab against an existing tag - useful if a publish failed halfway.

Tags pushed by the Release workflow use `GITHUB_TOKEN` and therefore never trigger the Publish
workflow, so the two cannot publish the same version twice.

## Verifying a publish locally

```bash
pnpm local-registry            # verdaccio on :4873, in one terminal
pnpm exec nx release publish --registry http://localhost:4873 --tag next
```

## Secrets and permissions

- `NPM_TOKEN` - an npm automation token with publish rights on the `@xui` scope.
- The workflows request `id-token: write` so npm provenance is attached to every package, and the
  release job needs `contents: write` to push the release commit, tag and GitHub Release.
