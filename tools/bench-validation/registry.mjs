import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { serve } from '../bench-pages/serve.mjs'

/** Records the compiled host registry independently of the measured raw artifacts. */
export async function registry(directory) {
	const { server, base } = serve()
	const browser = await chromium.launch()
	const expected = {}
	try {
		for (const fw of ['vue', 'react', 'angular', 'svelte', 'solid', 'webc']) {
			const page = await browser.newPage()
			await page.goto(`${base}?fw=${fw}`)
			await page.waitForFunction(() => 'bench' in window)
			expected[fw] = await page.evaluate(() => bench.pages)
			await page.close()
		}
	} finally {
		await browser.close()
		server.close()
	}
	fs.writeFileSync(
		path.join(directory, 'registry.json'),
		JSON.stringify({ schemaVersion: 1, date: new Date().toISOString(), pages: expected }) +
			'\n',
	)
	return expected
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/bench-validation/registry.mjs'))
	await registry(process.argv[2])
