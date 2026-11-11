import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ciUbuntuSources } from './ubuntu-mirror.mjs'

const MIRROR = 'https://mirrors.edge.kernel.org/ubuntu'
const key = 'Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg'

test('replaces runner mirror-method sources and preserves signed deb822 fields', () => {
	const before =
		'Types: deb\nURIs: mirror+file:/etc/apt/apt-mirrors.txt\nSuites: noble noble-updates noble-backports\nComponents: main universe restricted multiverse\n' +
		key +
		'\n\nTypes: deb\nURIs: mirror+file:/etc/apt/apt-mirrors.txt\nSuites: noble-security\nComponents: main universe restricted multiverse\n' +
		key +
		'\n'
	const expected = before.replaceAll('mirror+file:/etc/apt/apt-mirrors.txt', MIRROR)

	assert.equal(ciUbuntuSources(before), expected)
	assert.equal(ciUbuntuSources(expected), expected)
})

test('supports direct Azure sources and classic signed list entries', () => {
	const before =
		'deb [signed-by=/keys/ubuntu.gpg] http://azure.archive.ubuntu.com/ubuntu/ noble main\n' +
		'deb-src mirror+file:///etc/apt/apt-mirrors.txt noble-security main\n'
	const expected =
		'deb [signed-by=/keys/ubuntu.gpg] ' +
		MIRROR +
		' noble main\n' +
		'deb-src ' +
		MIRROR +
		' noble-security main\n'

	assert.equal(ciUbuntuSources(before), expected)
})

test('also replaces fresh canonical archive and security sources', () => {
	const before =
		'Types: deb\nURIs: https://archive.ubuntu.com/ubuntu/\nSuites: noble noble-updates\n' +
		key +
		'\n\nTypes: deb\nURIs: https://security.ubuntu.com/ubuntu\nSuites: noble-security\n' +
		key +
		'\n'
	const expected = before
		.replace('https://archive.ubuntu.com/ubuntu/', MIRROR)
		.replace('https://security.ubuntu.com/ubuntu', MIRROR)

	assert.equal(ciUbuntuSources(before), expected)
})

test('preserves third-party and already selected mirror sources', () => {
	const source =
		'Types: deb\nURIs: ' +
		MIRROR +
		'\nSuites: noble-security\n' +
		key +
		'\n\n' +
		'deb https://packages.microsoft.com/ubuntu/24.04/prod noble main\n'

	assert.equal(ciUbuntuSources(source), source)
})
