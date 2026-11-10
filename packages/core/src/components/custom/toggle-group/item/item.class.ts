import { TButton } from '../../button'
import type { IToggleGroupItem, IToggleGroupItemProps } from './types'

export class TToggleGroupItem extends TButton<IToggleGroupItemProps> implements IToggleGroupItem {
	constructor(props: Partial<IToggleGroupItemProps> = {}) {
		super(props)
		this.classes.add('so-toggle-group-item', false)
	}
	/** A toggle changes state without submitting its surrounding form by default. */
	protected override _syncButtonAria(): void {
		super._syncButtonAria()
		this.attrs.add('type', this.tag === 'button' ? 'button' : null)
	}
}
export default TToggleGroupItem
