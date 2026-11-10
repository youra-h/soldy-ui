import { it, expect } from 'vitest'
import { CodeBlockPage } from './pages'
import { expectServedNodes, hydrateServed, markupOf, serve } from './serve'
it('hydrates CodeBlock and its active Tabs panel without replacing server nodes', () => {
	const container = serve(markupOf('code-block'))
	const nodes = [...container.querySelectorAll('*')]
	hydrateServed(container, () => <CodeBlockPage />)
	expectServedNodes([...container.querySelectorAll('*')], nodes)
	expect(container.querySelector('.so-code-block__text')?.textContent).toBe('<img src=x>\n')
})
