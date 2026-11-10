import type { IButton, IButtonProps } from '../../button'
import type { ISelectionCollectionItemProps } from '../../../base/collection'

export interface IToggleGroupItemProps extends IButtonProps, ISelectionCollectionItemProps {}
export interface IToggleGroupItem extends IButton<IToggleGroupItemProps> {}
