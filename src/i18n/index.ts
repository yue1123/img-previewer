import en from './lib/en'
import zh from './lib/zh_cn'
import type { Ii18n } from '../types'

// all display in English except Chinese, user texts override the built-in ones
export function getLocale(custom?: Ii18n): Required<Ii18n> {
	const locale = /^zh/i.test(window.navigator.language) ? zh : en
	return { ...locale, ...custom }
}

export default { en, zh }
