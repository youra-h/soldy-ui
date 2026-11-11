<script lang="ts">
	import { Dynamic, toRootProps } from '../../adapter'
	import { setupAvatar } from './setup.component'
	import type { AvatarProps } from './base.component'

	let { ref = $bindable(), ...props }: AvatarProps = $props()
	const mountId = $props.id()

	const binding = setupAvatar(() => props, mountId, (node) => (ref = node))
	const state = binding.state
</script>

<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(state, [state.attrs, state.aria, state.dataset], binding.forwardProps)}
	attach={binding.attachElement}
>
	{#if state.status === 'loaded'}<img
		class="so-avatar__image" src={state.src || undefined} alt=""
	/>{:else}<span
		class="so-avatar__fallback" aria-hidden="true"
	>{@render (props.fallback ?? plain)()}</span>{/if}
</Dynamic>

{#snippet plain()}{state.initials}{/snippet}
