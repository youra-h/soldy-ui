import { TOverlayFocusPlugin } from '../focus'

/** Persistent dialog keyboard behavior: Escape inside, natural Tab order and no focus transfer. */
export class TNonmodalDialogFocusPlugin extends TOverlayFocusPlugin {
	protected override _panelFallback(root: Element): Element {
		return root
	}

	protected override _onTab(_event: KeyboardEvent): void {}

	protected override _focusPanel(): void {}

	protected override _returnsFocus(_root: Element): boolean {
		return false
	}
}
