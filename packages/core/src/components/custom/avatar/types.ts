import type { TThemeRegistry, TValuePayload } from '../../../common'
import type { IStylable, IStylableProps, TStylableEvents } from '../../base/stylable'

/** Appearance values are supplied by the active theme. */
export interface IAvatarShapes extends TThemeRegistry {}
export type TAvatarShape = Extract<keyof IAvatarShapes, string>
export type TAvatarStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface IAvatarProps extends IStylableProps {
	src?: string
	/** Already formatted initials, preserved without segmentation or case conversion. */
	initials?: string
	shape?: TAvatarShape
}

export type TAvatarEvents = TStylableEvents & {
	'change:src': (payload: TValuePayload<string>) => void
	'change:initials': (payload: TValuePayload<string>) => void
	'change:shape': (payload: TValuePayload<TAvatarShape | undefined>) => void
	'change:status': (payload: TValuePayload<TAvatarStatus>) => void
}

export interface IAvatar extends IStylable<IAvatarProps, TAvatarEvents> {
	src: string
	initials: string
	shape: TAvatarShape | undefined
	/** Written by the image plugin; adapters only read this output. */
	status: TAvatarStatus
}
