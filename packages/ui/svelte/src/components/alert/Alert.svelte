<script lang="ts">
	import { clickAction, Dynamic, roleIcon, toRootProps } from '../../adapter'
	import { Button } from '../button'
	import { Icon } from '../icon'
	import { setupAlert } from './setup.component'
	import type { AlertProps } from './base.component'

	let { ref = $bindable(), ...props }: AlertProps = $props()
	const mountId = $props.id()

	const binding = setupAlert(() => props, mountId, (node) => (ref = node))
	const state = binding.state
	const CLOSE = roleIcon('close')
	const close = clickAction(() => binding.ctrl.hide())
</script>

<Dynamic rendered={state.rendered} tag={state.tag} attributes={toRootProps(state, [state.attrs, state.aria, state.dataset], binding.forwardProps)} attach={binding.attachElement}>
	<span class="so-alert__icon" aria-hidden="true">{@render props.icon?.()}</span><div class="so-alert__body">
		<div class="so-alert__title">{@render props.title?.()}</div>
		<div class="so-alert__content">{@render props.children?.()}</div>
	</div><div class="so-alert__action">{@render props.action?.()}</div>{#if state.closable}
		<Button embedded="alert.close" type="button" class="so-alert__close" {@attach close} {...state.closeAria}>
			<span aria-hidden="true">{#if props['close-icon']}{@render props['close-icon']()}{:else}<Icon embedded="alert.close-icon" tag={CLOSE} />{/if}</span>
		</Button>
	{/if}
</Dynamic>
