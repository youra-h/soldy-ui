# Public adapter API guard

Run `npm run check:public-api` after `npm run build`. CI runs it in the build job.

`exports.json` is the reviewed list of application exports for all six adapters and the
individual Web Components entries. Values and type-only exports are checked separately.
The guard compares the source entry, built declarations and built JavaScript with that list;
it does not evaluate modules or register custom elements. Update the list deliberately when
adding or removing public API, together with the consumer documentation and changeset.

The install-smoke projects additionally compile supported props and helpers, reject an
incorrect prop value, and reject assembly imports and the nonexistent `/internal` entry
against installed tarballs.
