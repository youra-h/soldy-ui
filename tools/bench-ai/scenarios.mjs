import assert from 'node:assert/strict'

export const calendarTrigger = (page) => {
	const candidate = page.getByRole('region', { name: 'Candidate', exact: true })
	return candidate
		.getByRole('button')
		.and(candidate.locator('[aria-haspopup="dialog"], [aria-haspopup="grid"]'))
		.or(candidate.getByRole('button', { name: /calendar|choose date|اختيار التاريخ/i }))
		.first()
}

/** The segmented field is the documented Soxa return target; other candidates use their opener. */
export async function calendarFocusReturned(page) {
	const candidate = page.getByRole('region', { name: 'Candidate', exact: true })
	const segments = candidate.locator('.so-date-input__segment[role="spinbutton"]')
	const target = (await segments.count()) ? segments.first() : calendarTrigger(page)
	await eventually(
		() => target.evaluateAll((nodes) => nodes.includes(document.activeElement)),
		'Escape must restore focus to the documented date field or opener',
	)
}

export async function selectTouch(page) {
	const combo = page.getByRole('combobox', { name: 'Choose items' })
	const arrow = page.locator('.so-select__arrow')
	await tap(page, combo)
	if ((await arrow.count()) && (await combo.getAttribute('readonly')) === null) {
		assert(
			await combo.evaluate((node) => node === document.activeElement),
			'Touch must focus editable text',
		)
		assert.equal(
			await combo.getAttribute('aria-expanded'),
			'false',
			'Text touch must preserve editing without opening',
		)
	}
	const opener = (await arrow.count()) ? arrow : combo
	if ((await combo.getAttribute('aria-expanded')) !== 'true') await tap(page, opener)
	await page.getByRole('listbox').waitFor({ state: 'visible' })
	const option = page.getByRole('option', { name: 'Alpha 1', exact: true })
	await tap(page, option)
	if ((await combo.getAttribute('aria-expanded')) === 'false') {
		await tap(page, opener)
		await page.getByRole('listbox').waitFor({ state: 'visible' })
	}
	await eventually(
		async () => (await option.getAttribute('aria-selected')) === 'true',
		'Touch must select Alpha 1',
	)
}

export function calendarDayName(language, day) {
	const numerals = [
		...new Set(
			['latn', 'arab', 'arabext'].map((numberingSystem) =>
				new Intl.NumberFormat(language, { useGrouping: false, numberingSystem }).format(
					day,
				),
			),
		),
	]
	return new RegExp(`(?<!\\p{N})(?:${numerals.join('|')})(?!\\p{N})`, 'u')
}
export const tableWidget = (page) =>
	page.getByRole('table', { name: 'Records' }).or(page.getByRole('grid', { name: 'Records' }))

/** Column semantics stay the same when the declared locale translates their names. */
export function tableColumnName(field, language = 'en') {
	const translations = {
		ar: { name: ['الاسم', 'اسم'], score: ['النتيجة', 'الدرجة', 'النقاط'] },
		ru: { name: ['Имя', 'Название'], score: ['Баллы', 'Оценка', 'Счёт'] },
	}
	const english = { name: 'Name', score: 'Score' }
	const names = [english[field], ...(translations[language.split('-')[0]]?.[field] ?? [])]
	return new RegExp(names.join('|'), 'iu')
}

const tableLanguage = (page) =>
	page.evaluate(
		() => document.querySelector('main')?.lang || document.documentElement.lang || 'en',
	)
async function calendarOpened(page) {
	await page.getByRole('dialog').waitFor({ state: 'visible' })
	await page.getByRole('grid').waitFor({ state: 'visible' })
}

/** Grid is a public alternative to Table, with its own minimal APG keyboard contract. */
export async function gridKeyboard(page, grid) {
	const entry = await grid.evaluate((root) => {
		const stops = [root, ...root.querySelectorAll('*')].filter(
			(node) =>
				node.tabIndex === 0 &&
				!node.matches(':disabled') &&
				node.getClientRects().length &&
				getComputedStyle(node).visibility === 'visible',
		)
		if (stops.length === 1) stops[0].focus()
		return stops.length
	})
	assert.equal(entry, 1, 'Data grid must have exactly one entry in the Tab sequence')
	const state = () =>
		grid.evaluate((root) => {
			const active = document.activeElement
			if (!root.contains(active)) return null
			const id =
				active.getAttribute('aria-activedescendant') ||
				root.getAttribute('aria-activedescendant')
			if (id) {
				const target = document.getElementById(id)
				if (
					!target ||
					!root.contains(target) ||
					!target.matches(
						'[role="gridcell"],[role="row"],[role="columnheader"],[role="rowheader"],td,th,tr',
					)
				)
					return null
				return 'aria:' + id
			}
			const cell = active.closest(
				'[role="gridcell"],[role="row"],[role="columnheader"],[role="rowheader"],td,th,tr',
			)
			return cell && root.contains(cell)
				? 'dom:' +
						[
							...root.querySelectorAll(
								'[role="gridcell"],[role="row"],[role="columnheader"],[role="rowheader"],td,th,tr',
							),
						].indexOf(cell)
				: null
		})
	const initial = await state()
	assert(initial, 'Data grid must expose a focused cell/row or valid active descendant')
	await page.keyboard.press('ArrowDown')
	await eventually(async () => {
		const next = await state()
		return next && next !== initial
	}, 'ArrowDown must move the active grid cell/row')
	await page.keyboard.press('ArrowUp')
	await eventually(
		async () => (await state()) === initial,
		'ArrowUp must return to the initial grid cell/row',
	)
}
export async function eventually(check, message, timeout = 3000) {
	const until = Date.now() + timeout
	let lastError
	while (Date.now() < until) {
		try {
			if (await check()) return
		} catch (error) {
			lastError = error
		}
		await new Promise((resolve) => setTimeout(resolve, 30))
	}
	assert.fail(message + (lastError ? ` (${lastError.message.split('\n')[0]})` : ''))
}
async function focusedIn(locator) {
	await eventually(
		() => locator.evaluate((node) => node.contains(document.activeElement)),
		'Focus must remain inside the widget',
	)
}
async function activeOption(page, combo) {
	const id = await combo.getAttribute('aria-activedescendant')
	if (id) {
		const option = page.locator(`[id=${JSON.stringify(id)}]`)
		assert.equal(await option.count(), 1, 'Active descendant must resolve uniquely')
		assert.equal(
			await option.getAttribute('role'),
			'option',
			'Active descendant must be an option',
		)
		return option
	}
	const focused = page.locator(':focus')
	assert.equal(
		await focused.getAttribute('role'),
		'option',
		'Option focus or active descendant required',
	)
	return focused
}
export async function tabsKeyboard(page) {
	const tabs = page.getByRole('tab')
	assert.equal(await tabs.count(), 3)
	for (const [index, name] of ['Alpha', 'Beta', 'Gamma'].entries())
		assert.equal(
			await tabs
				.nth(index)
				.and(page.getByRole('tab', { name, exact: true }))
				.count(),
			1,
			`Tab ${index + 1} must be named ${name}`,
		)
	assert.equal(
		await page.getByRole('tab', { name: 'Alpha', exact: true }).getAttribute('aria-selected'),
		'true',
		'Alpha must initially be active',
	)
	assert.match(
		await page.getByRole('tabpanel', { name: 'Alpha', exact: true }).innerText(),
		/Alpha panel/,
	)
	await tabs.first().focus()
	await page.keyboard.press('End')
	await eventually(
		async () => (await tabs.last().getAttribute('aria-selected')) === 'true',
		'End must activate the last tab',
	)
	await eventually(
		() => tabs.last().evaluate((n) => n === document.activeElement),
		'End must focus the last tab',
	)
	await page.keyboard.press('Home')
	await eventually(
		async () => (await tabs.first().getAttribute('aria-selected')) === 'true',
		'Home must activate the first tab',
	)
	await page.keyboard.press('ArrowRight')
	await eventually(
		async () => (await tabs.nth(1).getAttribute('aria-selected')) === 'true',
		'ArrowRight must activate the next tab in LTR',
	)
	const panel = page.getByRole('tabpanel', { name: 'Beta' })
	assert(await panel.isVisible(), 'Selected tabpanel must be visible and named by its tab')
	assert.match(await panel.innerText(), /Beta panel/)
	assert.equal(
		await tabs.evaluateAll((nodes) => nodes.filter((n) => n.tabIndex === 0).length),
		1,
		'Exactly one tab stop',
	)
}
export async function scenario(component, page, count = 100) {
	if (component === 'tabs') return tabsKeyboard(page)
	if (component === 'select') {
		const combo = page.getByRole('combobox', { name: 'Choose items' })
		await combo.focus()
		await page.keyboard.press('ArrowDown')
		await page.getByRole('listbox').waitFor({ state: 'visible' })
		await activeOption(page, combo)
		await page.keyboard.press('Enter')
		await combo.focus()
		await page.keyboard.press('ArrowDown')
		await page.keyboard.press('ArrowDown')
		await page.keyboard.press('Enter')
		if ((await combo.getAttribute('aria-expanded')) === 'false') {
			await combo.focus()
			await page.keyboard.press('ArrowDown')
		}
		assert(
			(await page.getByRole('option', { selected: true }).count()) >= 2,
			'Multiple selection must retain two options',
		)
		await combo.fill('')
		await page.keyboard.type('Gam')
		await eventually(
			async () => (await (await activeOption(page, combo)).innerText()).includes('Gamma'),
			'Typed prefix must activate a matching option',
		)
		for (const key of ['Home', 'End']) {
			await page.keyboard.press(key)
			await eventually(async () => {
				const caret = await combo.evaluate((node) => ({
					start: node.selectionStart,
					length: node.value?.length,
				}))
				if (caret.start === (key === 'Home' ? 0 : caret.length)) return true
				try {
					const options = page.getByRole('option')
					const boundary = key === 'Home' ? options.first() : options.last()
					return (
						(await (await activeOption(page, combo)).innerText()) ===
						(await boundary.innerText())
					)
				} catch {
					return false
				}
			}, `${key} must preserve native caret movement or use the optional APG popup boundary variant`)
		}
		await page.keyboard.press('Space')
		assert(
			(await combo.inputValue()).includes(' '),
			'Space in an editable combobox must remain text input',
		)
		await combo.fill('Beta')
		const options = await page.getByRole('option').allTextContents()
		assert(
			options.length > 0 && options.every((text) => text.includes('Beta')),
			'Search must filter options',
		)
		await page.keyboard.press('Escape')
		assert.equal(await combo.getAttribute('aria-expanded'), 'false')
		assert(
			await combo.evaluate((node) => node === document.activeElement),
			'Escape must restore combobox focus',
		)
		if (count === 10000) {
			await combo.fill('')
			await page.keyboard.press('ArrowDown')
			await scrollToEnd(page)
			await eventually(
				async () =>
					(await page.getByRole('option').allTextContents()).some((text) =>
						text.trim().endsWith(' 10000'),
					),
				'Last logical option must remain reachable by scrolling',
			)
			const options = page.getByRole('option')
			if ((await options.count()) < 10000) {
				const last = options.filter({ hasText: / 10000$/ }).last()
				assert.equal(
					await last.getAttribute('aria-posinset'),
					'10000',
					'Virtual option must expose its logical position',
				)
				assert.equal(
					await last.getAttribute('aria-setsize'),
					'10000',
					'Virtual option must expose total logical set size',
				)
			}
		}
	} else if (component === 'dialog') {
		const trigger = page.getByRole('button', { name: 'Open dialog', exact: true })
		await trigger.click()
		const dialog = page.getByRole('dialog', { name: 'Settings' })
		await dialog.waitFor({ state: 'visible' })
		await dialog
			.getByRole('textbox', { name: 'Name', exact: true })
			.waitFor({ state: 'visible' })
		await dialog
			.getByRole('button', { name: 'Cancel', exact: true })
			.waitFor({ state: 'visible' })
		await dialog
			.getByRole('button', { name: 'Save', exact: true })
			.waitFor({ state: 'visible' })
		await focusedIn(dialog)
		for (let i = 0; i < 8; i++) {
			await page.keyboard.press('Tab')
			await focusedIn(dialog)
		}
		for (let i = 0; i < 8; i++) {
			await page.keyboard.press('Shift+Tab')
			await focusedIn(dialog)
		}
		await page.keyboard.press('Escape')
		await dialog.waitFor({ state: 'hidden' })
		await eventually(
			() => trigger.evaluate((node) => node === document.activeElement),
			'Escape must return focus to opener',
		)
	} else if (component === 'date-picker') {
		const trigger = calendarTrigger(page)
		await trigger.click()
		const grid = page.getByRole('grid')
		await calendarOpened(page)
		await page.keyboard.press('ArrowRight')
		await focusedIn(grid)
		const currentMonth = await grid.getByRole('gridcell').allTextContents()
		await page.keyboard.press('PageDown')
		await eventually(
			async () =>
				JSON.stringify(await grid.getByRole('gridcell').allTextContents()) !==
				JSON.stringify(currentMonth),
			'PageDown must navigate to the next month',
		)
		await page.keyboard.press('PageUp')
		await eventually(
			async () =>
				JSON.stringify(await grid.getByRole('gridcell').allTextContents()) ===
				JSON.stringify(currentMonth),
			'PageUp must return to the original month',
		)
		await page.keyboard.press('Home')
		await page.keyboard.press('End')
		const language = (await page.locator('main').getAttribute('lang')) ?? 'en'
		const day = grid
			.getByRole('gridcell', {
				name: calendarDayName(language, 15),
			})
			.first()
		await day.click()
		assert.match(await page.getByLabel('Selected date').innerText(), /2026-11-15|15/)
		await trigger.click()
		await page.keyboard.press('Escape')
		await grid.waitFor({ state: 'hidden' })
		await calendarFocusReturned(page)
	} else if (component === 'table') {
		const table = tableWidget(page)
		const language = await tableLanguage(page)
		assert(
			await table
				.getByRole('columnheader', { name: tableColumnName('score', language) })
				.isVisible(),
			'Table must include the Score column',
		)
		if ((await table.getAttribute('role')) === 'grid') await gridKeyboard(page, table)
		const heading = table.getByRole('columnheader', { name: tableColumnName('name', language) })
		const controls = heading.getByRole('button')
		const sort = (await controls.count()) ? controls.first() : heading
		await sort.click()
		assert(
			['ascending', 'descending'].includes(await heading.getAttribute('aria-sort')),
			'Sort state must be exposed',
		)
		const before = await table.getByRole('row').nth(1).innerText()
		await sort.click()
		assert.notEqual(
			await table.getByRole('row').nth(1).innerText(),
			before,
			'Sorting must reorder records',
		)
		const checkbox = table.getByRole('checkbox').first()
		await checkbox.click()
		assert(await checkbox.isChecked(), 'Select-all must be checked')
		assert.equal(
			await table.getByRole('checkbox', { checked: false }).count(),
			0,
			'Every row must be selected',
		)
	}
}

export async function openForAudit(component, page) {
	if (component === 'select') {
		const combo = page.getByRole('combobox', { name: 'Choose items' })
		await combo.focus()
		await page.keyboard.press('ArrowDown')
		await page.getByRole('listbox').waitFor({ state: 'visible' })
	}
	if (component === 'dialog') {
		await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
		await page.getByRole('dialog', { name: 'Settings' }).waitFor({ state: 'visible' })
	}
	if (component === 'date-picker') {
		await calendarTrigger(page).click()
		await calendarOpened(page)
	}
}

export async function touchScenario(component, page) {
	if (component === 'dialog') {
		await tap(page, page.getByRole('button', { name: 'Open dialog', exact: true }))
		await page.getByRole('dialog', { name: 'Settings' }).waitFor({ state: 'visible' })
	} else if (component === 'date-picker') {
		await tap(page, calendarTrigger(page))
		await calendarOpened(page)
	} else if (component === 'tabs') {
		const tab = page.getByRole('tab', { name: 'Beta', exact: true })
		await tap(page, tab)
		await eventually(
			async () => (await tab.getAttribute('aria-selected')) === 'true',
			'Touch must activate Beta tab',
		)
	} else if (component === 'select') {
		await selectTouch(page)
	} else if (component === 'table') {
		const table = tableWidget(page)
		const checkbox = table.getByRole('checkbox').first()
		await tap(page, checkbox)
		await eventually(() => checkbox.isChecked(), 'Touch must select rows')
	}
}

/** Reaches the last logical record through public DOM scrolling, including virtual tables. */
async function scrollToEnd(page) {
	await page.evaluate(() => {
		for (const node of document.querySelectorAll('body *')) {
			const style = getComputedStyle(node)
			if (node.scrollHeight > node.clientHeight && /auto|scroll/.test(style.overflowY))
				node.scrollTop = node.scrollHeight
		}
		scrollTo(0, document.documentElement.scrollHeight)
	})
}
export async function lastTableRecord(page) {
	const table = tableWidget(page)
	const heading = table.getByRole('columnheader', {
		name: tableColumnName('name', await tableLanguage(page)),
	})
	const direction = await heading.getAttribute('aria-sort')
	assert(
		['ascending', 'descending'].includes(direction),
		'Large table must retain its active sort state',
	)
	const expected = direction === 'ascending' ? 'Record 10000' : 'Record 00001'
	await scrollToEnd(page)
	const last = table.getByRole('row').filter({ has: page.getByText(expected, { exact: true }) })
	await eventually(
		() => last.isVisible(),
		'Last logical record must remain reachable in the current sort direction',
	)
	assert.equal(
		await heading.getAttribute('aria-sort'),
		direction,
		'Scrolling must preserve the active sort direction',
	)
	assert(
		await last.getByRole('checkbox').isChecked(),
		'Select-all must persist for the last logical record after scrolling',
	)
	assert(
		(await table.getByRole('row').count()) >= 10001 ||
			(await table.getAttribute('aria-rowcount')) === '10001',
		'Large table must expose all 10000 logical records plus its header, through DOM rows or aria-rowcount',
	)
}

/** Uses the same DevTools operation as the existing test:layout compose helper. */
export async function ime(page) {
	const combo = page.getByRole('combobox', { name: 'Choose items' })
	await combo.focus()
	await page.keyboard.press('ArrowDown')
	await page.getByRole('listbox').waitFor({ state: 'visible' })
	const selected = await page.getByRole('option', { selected: true }).allTextContents()
	const session = await page.context().newCDPSession(page)
	await session.send('Input.imeSetComposition', {
		text: 'Alpha',
		selectionStart: 5,
		selectionEnd: 5,
	})
	await page.keyboard.press('Enter')
	assert.equal(
		await combo.getAttribute('aria-expanded'),
		'true',
		'Pending IME Enter must not close the option popup',
	)
	assert.deepEqual(
		await page.getByRole('option', { selected: true }).allTextContents(),
		selected,
		'Unfinished IME Enter must not select an option',
	)
	await session.send('Input.imeSetComposition', {
		text: 'に',
		selectionStart: 1,
		selectionEnd: 1,
	})
	await session.send('Input.insertText', { text: '日本' })
	assert((await combo.inputValue()).includes('日本'), 'IME must commit composed Unicode text')
	await session.detach()
}

/** A real touch input through Playwright's portable Chromium/WebKit mechanism. */
export async function tap(page, locator) {
	await locator.tap()
}
