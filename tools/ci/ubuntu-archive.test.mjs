import { test } from 'node:test'
import assert from 'node:assert/strict'
import { officialUbuntuSources } from './ubuntu-archive.mjs'

const key = 'Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg'

test('selects direct archive and security URIs without changing signed deb822 fields', () => {
	const before =
		'Types: deb\nURIs: mirror+file:/etc/apt/apt-mirrors.txt\nSuites: noble noble-updates noble-backports\nComponents: main universe restricted multiverse\n' +
		key +
		'\n\nTypes: deb\nURIs: mirror+file:/etc/apt/apt-mirrors.txt\nSuites: noble-security\nComponents: main universe restricted multiverse\n' +
		key +
		'\n'
	const expected = before
		.replace('mirror+file:/etc/apt/apt-mirrors.txt', 'https://archive.ubuntu.com/ubuntu')
		.replace('mirror+file:/etc/apt/apt-mirrors.txt', 'https://security.ubuntu.com/ubuntu')

	assert.equal(officialUbuntuSources(before), expected)
	assert.equal(officialUbuntuSources(expected), expected)
})

test('supports direct Azure sources and classic signed list entries', () => {
	const before =
		'deb [signed-by=/keys/ubuntu.gpg] http://azure.archive.ubuntu.com/ubuntu/ noble main\n' +
		'deb-src mirror+file:///etc/apt/apt-mirrors.txt noble-security main\n' +
		'deb https://packages.microsoft.com/ubuntu/24.04/prod noble main\n'
	const expected =
		'deb [signed-by=/keys/ubuntu.gpg] https://archive.ubuntu.com/ubuntu noble main\n' +
		'deb-src https://security.ubuntu.com/ubuntu noble-security main\n' +
		'deb https://packages.microsoft.com/ubuntu/24.04/prod noble main\n'

	assert.equal(officialUbuntuSources(before), expected)
})

test('preserves existing official and third-party sources', () => {
	const source =
		'Types: deb\nURIs: https://security.ubuntu.com/ubuntu\nSuites: noble-security\n' +
		key +
		'\n'
	assert.equal(officialUbuntuSources(source), source)
})
