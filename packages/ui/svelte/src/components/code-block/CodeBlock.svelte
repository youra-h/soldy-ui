<script lang="ts">
	import type { ICodeBlockLine, TDatasetAttributes } from '@soxa-ui/core'
	import { Dynamic, toRootProps, clickAction, roleIcon } from '../../adapter'
	import { Tabs, TabsContent } from '../tabs'
	import { Button } from '../button'
	import { Icon } from '../icon'
	import { setupCodeBlock } from './setup.component'
	import type { CodeBlockProps } from './base.component'

	let { ref = $bindable(), ...props }: CodeBlockProps = $props()
	const mountId = $props.id()
	const binding = setupCodeBlock(() => props, mountId, (node) => (ref = node))
	const state = binding.state
	const copy = clickAction(() => binding.ctrl.copy())
	const COPY_ICON = roleIcon('copy')
</script>

{#snippet pre(lines: readonly ICodeBlockLine[], dataset: TDatasetAttributes | undefined)}
	<pre
		class="so-code-block__pre"
		role="region"
		{...state.contentAttrs}
		{...state.contentAria}
		style:max-height={state.contentStyle?.['max-height']}
	><code class="so-code-block__code" {...dataset}>{#each lines as line (line.number)}<span
		class="so-code-block__line"
		{...line.dataset}
	>{#if state.lineNumbers}<span class="so-code-block__gutter" aria-hidden="true">{line.number}</span>{/if}<span
		class="so-code-block__text"
	>{#if line.tokens}{#each line.tokens as token}<span {...token.dataset}>{token.text}</span>{/each}{:else}{line.text}{/if}</span></span>{/each}</code></pre>
{/snippet}

{#snippet action()}
	{#if state.copyable}<Button
		type="button"
		embedded="code-block.copy"
		class="so-code-block__copy"
		size={state.size}
		aria-label={state.names_copy}
		ctrl={binding.ctrl.copyButton}
		{@attach copy}
	>{#if props.copy}{@render props.copy()}{:else}<Icon embedded="code-block.copy-icon" tag={COPY_ICON} size={state.size} />{/if}</Button>{/if}
{/snippet}

{#snippet toolbar()}
	{#if state.displayTitle}{@render props['title-icon']?.()}{/if}
	{#if state.displayTitle}<span class="so-code-block__title">{state.displayTitle}</span>{/if}
	{@render action()}
{/snippet}

{#snippet content()}
	{#each state.panels as panel (panel.value)}
		<TabsContent value={panel.value} embedded="code-block.panel" class="so-code-block__content">
			{@render pre(panel.lines, panel.dataset)}
		</TabsContent>
	{/each}
{/snippet}

<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(state, [state.attrs, state.aria, state.dataset], binding.forwardProps)}
	attach={binding.attachElement}
>
	{#if state.displayTitle && !state.tabbed}<div class="so-code-block__header">
		{@render props['title-icon']?.()}<span class="so-code-block__title">{state.displayTitle}</span>{@render action()}
	</div>{/if}{#if state.tabbed}<Tabs
		ctrl={binding.ctrl.tabs}
		engine={binding.ctrl.engine}
		trailing={toolbar}
		embedded="code-block.tabs"
		class="so-code-block__tabs"
		{content}
	/>{:else}<div class="so-code-block__content">{@render pre(state.lines ?? [], state.codeDataset)}{#if !state.displayTitle}{@render action()}{/if}</div>{/if}<span class="so-code-block__status" role="status" aria-live="polite" aria-atomic="true">{state.names_message}</span>
</Dynamic>
