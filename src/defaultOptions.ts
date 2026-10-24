import type { ImgPreviewerOptions, ResolvedOptions } from './types'

const defaultOptions: ResolvedOptions = {
	fillRatio: 0.8,
	imageZoom: {
		min: 1,
		max: 5,
		step: 0.1
	},
	style: {
		modalOpacity: 0.6,
		headerOpacity: 0,
		zIndex: 99
	},
	triggerEvent: 'click',
	dataUrlKey: 'src',
	bubblingLevel: 0,
	hideOriginal: false
}

// merge user options with defaults, never mutates the user's object
export function resolveOptions(options: ImgPreviewerOptions = {}): ResolvedOptions {
	return {
		...defaultOptions,
		...options,
		fillRatio: options.fillRatio || defaultOptions.fillRatio,
		imageZoom: { ...defaultOptions.imageZoom, ...options.imageZoom },
		style: { ...defaultOptions.style, ...options.style }
	}
}

export default defaultOptions
