import { describe, it, expect } from 'vitest'
import {
	AlertDialogDescriptor,
	DialogDescriptor,
	DrawerDescriptor,
	createAdapterContext,
} from '@soxa-ui/setup'
import { TModalFocusPlugin, TAlertDialogFocusPlugin } from '@soxa-ui/plugins'
describe('AlertDialog descriptor', () => {
	it('installs exactly one focus strategy per modal component', () => {
		const alert = AlertDialogDescriptor()
		expect(
			alert.plugins
				.filter(
					(plugin) =>
						plugin.ctor === TModalFocusPlugin ||
						plugin.ctor === TAlertDialogFocusPlugin,
				)
				.map((plugin) => plugin.ctor),
		).toEqual([TAlertDialogFocusPlugin])
		for (const descriptor of [DialogDescriptor(), DrawerDescriptor()])
			expect(
				descriptor.plugins.filter((plugin) => plugin.ctor === TModalFocusPlugin),
			).toHaveLength(1)
	})
	it('publishes only its supported modal contract and scoped footer commands', () => {
		const descriptor = AlertDialogDescriptor()
		expect(descriptor.slots.map((slot) => slot.name)).toEqual([
			'title',
			'default',
			'action',
			'cancel',
			'footer',
			'close-icon',
		])
		const context = createAdapterContext(descriptor, {})
		expect(context.instance.aria.get('role')).toBe('alertdialog')
		expect(context.instance.aria.get('aria-describedby')).toBe(
			context.instance.bodyAria.get('id'),
		)
		expect(descriptor.props.map((prop) => prop.name.name)).not.toEqual(
			expect.arrayContaining(['modal', 'alert', 'maximized']),
		)
		context.destroy()
	})
})
