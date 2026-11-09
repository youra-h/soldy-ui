export class DocumentIntegrationError extends Error {
	constructor(message) {
		super(message)
		this.name = 'DocumentIntegrationError'
	}
}

/** Injects identical SSR/client inputs without depending on HTML formatting. */
export function renderDocument(template, html, props, teleports = {}) {
	if (template.split('<!--ssr-->').length !== 2)
		throw new DocumentIntegrationError('Expected exactly one SSR placeholder')
	let inputs = 0
	const json = JSON.stringify(props).replaceAll('<', '\\u003c')
	const document = template.replace(
		/(<script\b[^>]*>)[\s\S]*?(<\/script\s*>)/gi,
		(script, opening, closing) => {
			if (!/\sid\s*=\s*(["'])input\1/i.test(opening)) return script
			if (!/\stype\s*=\s*(["'])application\/json\1/i.test(opening))
				throw new DocumentIntegrationError('Client input must use application/json')
			inputs++
			return opening + json + closing
		},
	)
	if (inputs !== 1) throw new DocumentIntegrationError('Expected exactly one client input script')
	let rendered = document.replace('<!--ssr-->', () => html)
	for (const [target, content] of Object.entries(teleports)) {
		if (!content) continue
		const id = /^#([\w:.-]+)$/.exec(target)?.[1]
		if (target !== 'body' && !id)
			throw new DocumentIntegrationError(`Unsupported SSR teleport target: ${target}`)
		let targets = 0
		rendered = rendered.replace(
			/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<[a-z][^>]*>/gi,
			(opening) => {
				if (/^<!--|^<script\b/i.test(opening)) return opening
				const matches =
					target === 'body'
						? /^<body(?:\s|>)/i.test(opening)
						: /\sid\s*=\s*(["'])([^"']*)\1/i.exec(opening)?.[2] === id
				if (!matches) return opening
				targets++
				return opening + content
			},
		)
		if (targets !== 1)
			throw new DocumentIntegrationError(
				`Expected exactly one SSR teleport target: ${target}`,
			)
	}
	return rendered
}
