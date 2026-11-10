<script lang="ts">
	import { Dynamic, toRootProps } from '../../adapter'
	import { setupBadge } from './setup.component'
	import type { BadgeProps } from './base.component'

	let { ref = $bindable(), ...props }: BadgeProps = $props()
	const mountId = $props.id()
	const binding = setupBadge(() => props, mountId, (node) => (ref = node))
	const state = binding.state
</script>

<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(state, [state.attrs, state.dataset], binding.forwardProps)}
	attach={binding.attachElement}
>
	<span class="so-badge__anchor">{@render props.anchor?.()}</span><span
		class="so-badge__indicator" {...state.aria}
	>{state.displayValue}</span>
</Dynamic>
