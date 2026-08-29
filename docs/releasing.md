# Releasing

Every publishable package shares one version (a fixed release group): `@xui/core`, the 90
`@xui/<component>` packages, `@xui/tools` and `@xui/mcp`. `libs/testing`, the docs app and
Storybook are not published.

## How a release happens

Pushing to `master` runs [`.github/workflows/release.yml`](../.github/workflows/release.yml),
which:

1. **Decides whether there is anything to release** - it looks for a `feat`, `fix`, `perf`,
   `revert` or breaking-change commit since the last stable `v*` tag. Anything else (docs, chore,
   refactor, test) is not a release on its own, and the run stops.
2. **Verifies the workspace** - `nx run-many -t lint test`.
3. **Versions** - `nx release` builds every package, resolves the current version from the latest
   stable `v*` tag, and writes the new one into both the source and the `dist` manifests, so the
   artifacts that get published carry the version that was just tagged.
4. **Writes the changelog**, commits `chore(release): publish <version> [skip ci]`, tags, pushes and
   creates the GitHub Release.
5. **Publishes to npm** with provenance, under the dist-tag that matches the version.

`master` is the release line - `develop` was fast-forwarded into it, so every v2 tag is reachable
from `master`. If that changes, update the branch in `release.yml` and `defaultBase` in `nx.json`.

## Version bumps

A push to `master` always releases the next **stable** version: the conventional commits since the
last stable tag decide between patch, minor and major, and no preid is passed. `2.2.5` + a `fix:`
is `2.2.6`, not `2.2.6-alpha.0`.

A prerelease is a deliberate manual run: **Actions → Release → Run workflow** with an explicit
`specifier`. Any `pre*` specifier gets `--preid alpha`.

| Specifier    | Result from `2.2.5`                       |
| ------------ | ----------------------------------------- |
| _(empty)_    | `2.2.6` (or higher, per the commits)      |
| `minor`      | `2.3.0`                                   |
| `prepatch`   | `2.2.6-alpha.0`                           |
| `prerelease` | `2.2.6-alpha.1` once an alpha line exists |
| `2.3.0`      | `2.3.0`                                   |

The same dialog has a `dryRun` toggle that runs the whole pipeline without tagging, pushing or
publishing.

Prerelease tags never influence an automatic run - `releaseTag.strictPreid` is on, so with no preid
Nx only looks at stable tags. An alpha cut by hand therefore does not hold up the next stable
release, but it also does not reserve its version: after a manual `2.3.0-alpha.0`, a push to
`master` still cuts `2.2.6` from `2.2.5`. Finish an alpha line with an explicit specifier before
letting `master` release again.

## npm dist-tags

- A version with a prerelease part (`2.0.0-alpha.9`) publishes under **`next`**.
- A stable version publishes under **`latest`**.

So `pnpm add @xui/button` gets the newest stable release, and `pnpm add @xui/button@next` gets the
current alpha. Since `master` releases stable versions, `next` only moves when someone cuts a
prerelease by hand.

## Commit messages are the release input

Commits are Conventional Commits, checked by commitlint in three places: the `commit-msg` git hook
(installed by the `prepare` script on `pnpm install`), the `Commit messages` CI job on every pull
request, and implicitly by the release itself, which reads them to decide the bump and the
changelog. A `chore:` commit ships nothing.

Scopes must come from the `scope-enum` list in `commitlint.config.mjs`, and are optional.

## Releasing by hand

Rarely needed - the workflow above is the supported path. If you must:

```bash
pnpm release:dry-run                   # preview: versions, changelog, tag
pnpm release                           # version, changelog, commit, tag, push
pnpm release prepatch --preid alpha    # ... or start an alpha line
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
