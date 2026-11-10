import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { CodeBlock, LocaleProvider } from '@soxa-ui/vue'
import { TCodeBlock } from '@soxa-ui/core'
import { ruRU } from '@soxa-ui/plugins'

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
	document.body.innerHTML = ''
})
describe('CodeBlock', () => {
	it('renders untrusted source as text with exact whitespace and no empty header', () => {
		const code = '<img src=x onerror=alert(1)>\n  x\n\n'
		const wrapper = mount(CodeBlock, { props: { code } })
		expect(wrapper.find('img').exists()).toBe(false)
		expect(wrapper.get('code').element.textContent).toBe(code)
		expect(wrapper.find('.so-code-block__header').exists()).toBe(false)
		expect(wrapper.get('pre').attributes('dir')).toBe('ltr')
		wrapper.unmount()
	})
	it('waits for clipboard success and reports failures in the locale subtree', async () => {
		let done: (() => void) | undefined
		const writeText = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					done = resolve
				}),
		)
		vi.stubGlobal('navigator', { clipboard: { writeText } })
		const ctrl = new TCodeBlock({ code: '  exact\r\n' })
		const copied = vi.fn()
		ctrl.events.on('copy', copied)
		const wrapper = mount(LocaleProvider, {
			props: { locale: ruRU },
			slots: { default: () => h(CodeBlock, { ctrl }) },
		})
		await wrapper.get('button').trigger('click')
		expect(writeText).toHaveBeenCalledWith(ctrl.code)
		expect(copied).not.toHaveBeenCalled()
		done?.()
		await nextTick()
		await nextTick()
		expect(copied).toHaveBeenCalledWith({ value: undefined, code: ctrl.code })
		expect(wrapper.get('[role=status]').text()).toBe('Скопировано')

		writeText.mockRejectedValueOnce(new Error('denied'))
		await wrapper.get('button').trigger('click')
		await nextTick()
		expect(wrapper.get('[role=status]').text()).toBe('Не удалось скопировать код')
		wrapper.unmount()
	})
	it('renders Tabs panels and copies the current snippet after activation', async () => {
		const ctrl = new TCodeBlock({
			snippets: [
				{ value: 'one', label: 'One', code: 'first' },
				{ value: 'two', label: 'Two', code: 'second' },
			],
		})
		const writeText = vi.fn().mockResolvedValue(undefined)
		vi.stubGlobal('navigator', { clipboard: { writeText } })
		const wrapper = mount(CodeBlock, { props: { ctrl } })
		expect(wrapper.find('[role=tablist]').exists()).toBe(true)
		ctrl.value = 'two'
		await nextTick()
		expect(wrapper.get('code').text()).toBe('second')
		await wrapper.get('.so-code-block__copy').trigger('click')
		expect(writeText).toHaveBeenCalledWith('second')
		wrapper.unmount()
	})
	it('hydrates safe text and line numbers without replacing server nodes', async () => {
		const tree = () => h(CodeBlock, { code: '<script>unsafe</script>\n', lineNumbers: true })
		const host = document.createElement('div')
		host.innerHTML = await renderToString(tree())
		document.body.append(host)
		const pre = host.querySelector('pre')
		const warn = vi.spyOn(console, 'warn')
		const app = createSSRApp({ render: tree })
		app.mount(host)
		await nextTick()
		expect(host.querySelector('pre')).toBe(pre)
		expect(warn).not.toHaveBeenCalled()
		app.unmount()
	})
})
