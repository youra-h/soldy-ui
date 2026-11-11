<script lang="ts">
	import { Dynamic, toRootProps } from '../../adapter'
	import { setupSeparator } from './setup.component'
	import type { SeparatorProps } from './base.component'

	let { ref = $bindable(), ...props }: SeparatorProps = $props()
	const mountId = $props.id()

	const binding = setupSeparator(() => props, mountId, (node) => (ref = node))
	const state = binding.state
</script>

<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(
		state,
		[state.attrs, state.aria, state.dataset],
		binding.forwardProps,
	)}
	attach={binding.attachElement}
/>
