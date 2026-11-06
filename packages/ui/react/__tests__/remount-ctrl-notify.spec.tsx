/**
 * Remounting a shared ctrl delivers the previous mount's notification after assembly.
 * A placement change during assembly must not update the parent during another component's render.
 */

import { describe, it, expect, vi } from 'vitest'
import { act, useState } from 'react'
import { TPopover } from '@soldy-ui/core'
import { Popover } from '@soldy-ui/react'
import { mount, nextFrame } from './mount'

describe('React: уведомление прежнего при перемонтировании над тем же ctrl', () => {
	it('обработчик уведомления прежнего, меняющий состояние родителя, зовётся после сборки', async () => {
		const ctrl = new TPopover()
		let move: (key: string) => void = () => {}
		const onChangePlacement = vi.fn()
		const Page = () => {
			const [key, setKey] = useState('a')
			const [, setSeen] = useState(0)

			move = setKey

			return (
				<Popover
					key={key}
					ctrl={ctrl}
					placement={key === 'a' ? 'bottom-start' : 'top-start'}
					onChangePlacement={() => {
						onChangePlacement()
						setSeen((seen) => seen + 1)
					}}
				>
					x
				</Popover>
			)
		}

		mount(<Page />)
		act(() => move('b'))
		await nextFrame()

		// The previous mount receives one notification after the new mount finishes assembly.
		expect(onChangePlacement).toHaveBeenCalledTimes(1)
	})
})
