/** Retrieve the node plugin through the public bundle output before change detection. */

import type { ComponentFixture } from '@angular/core/testing'
import { TElementPlugin, TPluginBundle } from '@soldy-ui/plugins'
import type { TComponentViewComponent } from '@soldy-ui/angular'

/** A component with `TElementPlugin` in its bundle: every visual one has the same `soBundleCreate`. */
type TWithBundleCreate = Pick<TComponentViewComponent, 'soBundleCreate'>

export function elementPlugin(fixture: ComponentFixture<TWithBundleCreate>): () => TElementPlugin {
	let plugin: TElementPlugin | undefined

	fixture.componentInstance.soBundleCreate.subscribe((value) => {
		if (value instanceof TPluginBundle) plugin = value.get(TElementPlugin)
	})

	return () => {
		if (!plugin) throw new Error('soBundleCreate не пришёл')

		return plugin
	}
}

/** The bundle announces itself on a microtask — see `TOwnBundle._announce`. */
export const announced = (): Promise<void> => Promise.resolve()
