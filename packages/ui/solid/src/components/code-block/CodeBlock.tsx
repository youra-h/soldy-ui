import type { JSX } from 'solid-js'
import type { ICodeBlockLine, TDatasetAttributes } from '@soxa-ui/core'
import { Root, createRootProps, createPartProps, renderSlot, clickAction } from '../../adapter'
import { Show, For } from '../../adapter/runtime/flow'
import { Tabs, TabsContent } from '../tabs'
import { Button } from '../button'
import { setupCodeBlock } from './setup.component'
import type { CodeBlockProps } from './base.component'
export function CodeBlock(props: CodeBlockProps): JSX.Element {
	const binding = setupCodeBlock(props)
	const state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.aria, state.dataset],
		forward: binding.forwardProps(),
	}))
	const copy = clickAction(() => binding.ctrl.copy())
	const copyButton = () => (
		<Show when={state.copyable}>
			<Button
				type="button"
				embedded="code-block.copy"
				class="so-code-block__copy"
				size={state.size}
				text={state.names_copy}
				disabled={state.copyDisabled}
				ref={copy}
			/>
		</Show>
	)

	const pre = (
		lines: () => readonly ICodeBlockLine[],
		dataset: () => TDatasetAttributes | undefined,
	) => {
		const codeAttrs = createPartProps(dataset)
		const preAttrs = createPartProps(() => ({ ...state.contentAttrs, ...state.contentAria }))
		return (
			<pre
				class="so-code-block__pre"

				role="region"
				{...preAttrs()}

				style={state.contentStyle}
			>
				<code class="so-code-block__code" {...codeAttrs()}>
					<For each={lines()}>
						{(line) => {
							const lineAttrs = createPartProps(() => line.dataset)
							return (
								<span class="so-code-block__line" {...lineAttrs()}>
									<Show when={state.lineNumbers}>
										<span class="so-code-block__gutter" aria-hidden="true">
											{line.number}
										</span>
									</Show>
									<span class="so-code-block__text">{line.text}</span>
								</span>
							)
						}}
					</For>
				</code>
			</pre>
		)
	}

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				<Show when={state.displayTitle}>
					<div class="so-code-block__header">
						{renderSlot(props['title-icon'])}
						<span class="so-code-block__title">{state.displayTitle}</span>
						{copyButton()}
					</div>
				</Show>
				<Show
					when={state.tabbed}
					fallback={
						<div class="so-code-block__content">
							{pre(
								() => state.lines ?? [],
								() => state.codeDataset,
							)}
							<Show when={!state.displayTitle}>{copyButton()}</Show>
						</div>
					}
				>
					<Tabs
						ctrl={binding.ctrl.tabs}
						engine={binding.ctrl.engine}
						trailing={state.displayTitle ? undefined : copyButton()}
						embedded="code-block.tabs"
						class="so-code-block__tabs"
						content={
							<For each={state.panels}>
								{(panel) => (
									<TabsContent
										value={panel.value}
										embedded="code-block.panel"
										class="so-code-block__content"
									>
										{pre(
											() => panel.lines,
											() => panel.dataset,
										)}
									</TabsContent>
								)}
							</For>
						}
					/>
				</Show>

				<span
					class="so-code-block__status"
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					{state.names_message}
				</span>
			</Root>
		</Show>
	)
}
