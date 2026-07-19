# @ovium/cli

Dev tooling for building out the Ovium model library. This isn't something end users of `@ovium/models` need — it's for adding new models to the ecosystem itself.

## Install

```bash
npm install -g @ovium/cli
```

Or run it without installing globally, using `npx @ovium/cli <command>`.

Either way, run these commands from the root of the Ovium monorepo — they expect to find `packages/models/src/` relative to wherever you run them.

## Commands

### `ovium create-model <name>`

Scaffolds a new model folder at `packages/models/src/<name>/` with the standard structure: a `types.ts` for your options interface, a `parts/` folder with one example part file to build from, an `index.ts` wiring it all together, and a starter `metadata.json`.

```bash
ovium create-model chair
```

This gets you a working (if minimal) model that already satisfies the `OviumModel` shape — replace the placeholder part with real geometry, and you're most of the way to a shippable model.

### `ovium validate [name]`

Checks a model folder against the rules every model in the library needs to follow: does it export the right shape (`object3D`, `parts`, `set`, `animate`, `dispose`), is `metadata.json` filled in with all the required fields, is the model actually broken into separate part files instead of one big blob.

```bash
ovium validate chair       # check one model
ovium validate             # check every model in packages/models/src/
```

Exits with a non-zero code if anything fails, so it's safe to drop into CI.

### `ovium build-catalog`

Scans every model's `metadata.json` and writes a single combined file to `apps/website/src/generated/catalog.json`. This is what the preview website reads to build its catalog page — run this after adding or changing a model so the site picks it up.

```bash
ovium build-catalog
```

## A typical new-model workflow

```bash
ovium create-model lamp
# ...go build the actual geometry in packages/models/src/lamp/parts/...
# ...fill in metadata.json...
# ...export createLamp from packages/models/src/index.ts...
ovium validate lamp
ovium build-catalog
```

## Status

Three commands so far. A `generate-thumbnail` command (headless-rendering a preview image for the catalog) is planned but not built yet — for now, thumbnails need to be added by hand.

## License

Copyrighted, all rights reserved — see the main Ovium project for details.
