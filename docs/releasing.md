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

`pnpm release` **pushes** the commit and tag. The `publish-tag` job in the same Release workflow
picks the tag up, re-verifies that the tag matches the workspace version, rebuilds and publishes. It
can also be run against an existing tag from **Actions → Release → Run workflow**, by filling in the
`tag` input - useful if a publish failed halfway. Leaving `tag` empty cuts a new release instead;
the two jobs are mutually exclusive.

This used to be a separate `publish.yaml`. It is one file now because npm matches a trusted-publisher
entry against the workflow's _filename_: a second file would need its own entry on every one of the
~95 packages, and `npm trust` writes only one entry per package. Both jobs living in `release.yml`
means the entry each package already carries covers both paths.

Tags pushed by the Release workflow itself use `GITHUB_TOKEN`, which by design does not trigger
further workflow runs, so a release cannot publish the same version twice.

## Verifying a publish locally

```bash
pnpm local-registry            # verdaccio on :4873, in one terminal
pnpm exec nx release publish --registry http://localhost:4873 --tag next
```

## Secrets and permissions

The Release workflow publishes through npm **trusted publishing**: no token is involved, and nothing
in the workflow writes one. npm mints a short-lived credential from the workflow's OIDC identity and
checks it against a trusted-publisher entry on each package, which names this repository and the
file `.github/workflows/release.yml`. Renaming that file, or moving the publish step into another
one, breaks every package's entry at once - npm matches the filename case-sensitively.

- `id-token: write` on both publishing jobs. This is what trusted publishing authenticates with, and
  what attaches provenance.
- `contents: write` on the release job, to push the release commit, tag and GitHub Release.
  There is no `NPM_TOKEN` secret and nothing needs one. If you ever reintroduce a second publishing
  workflow, remember that it cannot authenticate this way without its own trusted-publisher entry on
  each package.

### Configuring trusted publishing for a new package

A package must already exist on the registry before it can be trusted, which makes a brand-new
package's first publish the one case this setup cannot do on its own: publish it once from a laptop
with `npm publish` and your own account, then configure it. After that:

```bash
npm trust github @xui/<name> --repo Rikarin/xui --file release.yml --allow-publish
```

`npm trust list @xui/<name>` prints the entry; an unconfigured package prints nothing at all and
exits 0. The command needs a one-time password, and npm's web auth page offers a five-minute 2FA
skip - enough for roughly 80 packages in one scripted pass.
