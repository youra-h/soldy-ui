import { TButton } from '../../button'
import type { IToggleGroupItem, IToggleGroupItemProps } from './types'

export class TToggleGroupItem extends TButton<IToggleGroupItemProps> implements IToggleGroupItem {
	constructor(props: Partial<IToggleGroupItemProps> = {}) {
		super(props)
		this.classes.add('so-toggle-group-item', false)
	}
}
export default TToggleGroupItem
