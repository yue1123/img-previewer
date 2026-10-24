// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'

describe('ssr', () => {
	it('can be imported and constructed without window', async () => {
		const { default: ImgPreviewer } = await import('../src/index')
		expect(() => new ImgPreviewer('body')).not.toThrow()
	})

	it('built umd bundle can be required in node', () => {
		const require = createRequire(import.meta.url)
		const ImgPreviewer = require('../dist/img-previewer.js')
		expect(typeof ImgPreviewer).toBe('function')
		expect(() => new ImgPreviewer('body')).not.toThrow()
	})
})
