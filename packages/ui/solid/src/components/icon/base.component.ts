import type { IIcon } from '@soxa-ui/core'
import type { IconDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События слоя Icon (core + плагины), выведены из дескриптора автоматически. */
export type IconEventProps = EventProps<typeof IconDescriptor>

export type IconProps = UseDomProps<typeof IconDescriptor, IIcon, IconEventProps>
