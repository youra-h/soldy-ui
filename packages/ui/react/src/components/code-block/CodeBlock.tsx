import type { ElementType, ReactElement } from 'react'
import type { ICodeBlockLine, TDatasetAttributes } from '@soxa-ui/core'
import {
	Elevate,
	renderSlot,
	toRootProps,
	toReactStyle,
	toAriaProps,
	useClickAction,
	roleIcon,
} from '../../adapter'
import { Tabs, TabsContent } from '../tabs'
import { Button } from '../button'
import { Icon } from '../icon'
import { useSetupCodeBlock } from './setup.component'
import type { CodeBlockProps } from './base.component'

const COPY_ICON = roleIcon('copy')

export function CodeBlock(props: CodeBlockProps): ReactElement | null {
	const { ctrl, ref, forwardProps, state, layer } = useSetupCodeBlock(props)
	const copy = useClickAction(() => ctrl.copy())
	const pre = (lines: readonly ICodeBlockLine[], dataset: TDatasetAttributes | undefined) => (
		<pre
			className="so-code-block__pre"

			role="region"
			{...toAriaProps(state.contentAttrs)}
			{...toAriaProps(state.contentAria)}

			style={toReactStyle(state.contentStyle)}
		>
			<code className="so-code-block__code" {...dataset}>
				{lines.map((line) => (
					<span key={line.number} className="so-code-block__line" {...line.dataset}>
						{state.lineNumbers ? (
							<span className="so-code-block__gutter" aria-hidden="true">
								{line.number}
							</span>
						) : null}
						<span className="so-code-block__text">
							{line.tokens?.map((token, index) => (
								<span key={index} {...token.dataset}>
									{token.text}
								</span>
							)) ?? line.text}
						</span>
					</span>
				))}
			</code>
		</pre>
	)
	const copyButton = state.copyable ? (
		<Button
			tag="button"
			type="button"
			embedded="code-block.copy"
			className="so-code-block__copy"
			size={state.size}
			aria-label={state.names_copy}
			ctrl={ctrl.copyButton}
			key={ctrl.copyButton.uid}
			ref={copy}
		>
			{renderSlot(props.copy) ?? (
				<Icon embedded="code-block.copy-icon" tag={COPY_ICON} size={state.size} />
			)}
		</Button>
	) : null

	if (!state.rendered) return null
	const Tag = state.tag as ElementType
	return (
		<Elevate layer={layer}>
			<Tag
				{...toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps)}
			>
				{state.displayTitle && !state.tabbed ? (
					<div className="so-code-block__header">
						{renderSlot(props['title-icon'])}
						<span className="so-code-block__title">{state.displayTitle}</span>
						{copyButton}
					</div>
				) : null}
				{state.tabbed ? (
					<Tabs
						ctrl={ctrl.tabs}
						engine={ctrl.engine}
						trailing={
							<>
								{state.displayTitle ? renderSlot(props['title-icon']) : null}
								{state.displayTitle ? (
									<span className="so-code-block__title">
										{state.displayTitle}
									</span>
								) : null}
								{copyButton}
							</>
						}
						embedded="code-block.tabs"
						className="so-code-block__tabs"
						content={state.panels?.map((panel) => (
							<TabsContent
								key={panel.value}
								value={panel.value}
								embedded="code-block.panel"
								className="so-code-block__content"
							>
								{pre(panel.lines, panel.dataset)}
							</TabsContent>
						))}
					/>
				) : (
					<div className="so-code-block__content">
						{pre(state.lines ?? [], state.codeDataset)}
						{!state.displayTitle && copyButton}
					</div>
				)}

				<span
					className="so-code-block__status"
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					{state.names_message}
				</span>
			</Tag>
		</Elevate>
	)
}
