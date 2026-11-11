import { it, expect } from 'vitest'
import { TSeparator } from '@soxa-ui/core'
import { SeparatorDescriptor } from '../content/descriptors'
import { createAdapterContext } from '../protected/adapter'
import { CommonProfile } from '../protected/naming'

it('exchanges separator props, ctrl changes and removed defaults without DOM globals', () => {
	const ctrl = new TSeparator()
	const adapter = createAdapterContext(SeparatorDescriptor(), { ctrl })
	const exchange = adapter.connect(CommonProfile)
	const off = exchange.state.subscribe(() => {})

	try {
		expect(SeparatorDescriptor().slots).toEqual([])
		exchange.inputs.full({ orientation: 'vertical', decorative: true })
		expect(exchange.state.getSnapshot().aria).toEqual({ role: 'none' })

		ctrl.decorative = false
		expect(exchange.state.getSnapshot().aria).toEqual({
			role: 'separator',
			'aria-orientation': 'vertical',
		})

		exchange.inputs.full({})
		expect(ctrl.getProps()).toMatchObject({ orientation: 'horizontal', decorative: false })
		expect(exchange.state.getSnapshot().aria).toEqual({
			role: 'separator',
			'aria-orientation': 'horizontal',
		})
	} finally {
		off()
		adapter.destroy()
	}
})
