import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSoxaRename } from './mechanical-rename.mjs'

test('accepts only the approved case-preserving brand replacement', () => {
	assert.equal(
		isSoxaRename(
			'// Soldy UI: @soldy-ui/core; SOLDY_VERSION',
			'// Soxa UI: @soxa-ui/core; SOXA_VERSION',
		),
		true,
	)
})
test('does not exempt new or edited Cyrillic comments', () => {
	const before = '// Soldy: \u043f\u043e\u043b\u0435'
	assert.equal(isSoxaRename(before, '// Soxa: \u043f\u043e\u043b\u0435'), true)
	assert.equal(isSoxaRename(before, '// Soxa: \u043a\u043d\u043e\u043f\u043a\u0430'), false)
	assert.equal(
		isSoxaRename(
			before,
			'// Soxa: \u043f\u043e\u043b\u0435\n// \u043d\u043e\u0432\u043e\u0435',
		),
		false,
	)
})
test('rejects other source edits and unapproved casing', () => {
	assert.equal(
		isSoxaRename(
			"import x from '@soldy-ui/core'\nconst n = 1",
			"import x from '@soxa-ui/core'\nconst n = 2",
		),
		false,
	)
	assert.equal(isSoxaRename('Soldy', 'soxa'), false)
	assert.equal(isSoxaRename('soxa', 'soxa'), false)
	assert.equal(isSoxaRename('', '// \u043d\u043e\u0432\u043e\u0435'), false)
})
