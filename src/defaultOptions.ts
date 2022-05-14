const defaultOptions = {
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
	bubblingLevel: 0
} as const

export default defaultOptions
