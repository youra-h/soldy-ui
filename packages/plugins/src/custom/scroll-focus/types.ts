import type { IComponentView, TAttributes } from '@soxa-ui/core'

/** The model owns the output set; the plugin supplies facts measured in the browser. */
export interface IScrollFocusOwner extends Pick<IComponentView, 'classes'> {
	readonly scrollAttrs: TAttributes
}

export interface IScrollFocusOptions {
	readonly target: (owner: IScrollFocusOwner, root: Element) => Element | null
}
