<script lang="ts">
	import { Dynamic, toRootProps } from '../../../adapter'
	import { setupAvatarGroup } from './setup.component'
	import type { AvatarGroupProps } from './base.component'

	let { ref = $bindable(), ...props }: AvatarGroupProps = $props()
	const mountId = $props.id()

	const binding = setupAvatarGroup(() => props, mountId, (node) => (ref = node))
	const state = binding.state
</script>

<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(state, [state.attrs, state.aria, state.dataset], binding.forwardProps)}
	attach={binding.attachElement}
>
	{@render props.children?.()}{#if state.displayOverflow}<span
		class="so-avatar-group__overflow"
	>{@render (props['overflow-content'] ?? plain)({ count: state.overflow ?? 0 })}</span>{/if}
</Dynamic>

{#snippet plain(_scope: { count: number })}
	<span class="so-avatar-group__count">{state.displayOverflow}</span>
{/snippet}
