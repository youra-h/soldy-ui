<script lang="ts">
	import { Dynamic, toRootProps } from '../../adapter'
	import { setupToggleButton } from './setup.component'
	import type { ToggleButtonProps } from './base.component'

	let { ref = $bindable(), ...props }: ToggleButtonProps = $props()
	const mountId = $props.id()

	const binding = setupToggleButton(() => props, mountId, (node) => (ref = node))
	const state = binding.state
</script>

{#snippet plain()}{state.text}{/snippet}
<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(
		state,
		[state.attrs, state.aria, state.dataset],
		binding.forwardProps,
	)}
	attach={binding.attachElement}
>
	{#if props.leading}{@render props.leading()}{/if}<span class="so-button__text"
		>{@render (props.children ?? plain)({ text: state.text ?? '' })}</span
	>{#if props.trailing}{@render props.trailing()}{/if}
</Dynamic>
