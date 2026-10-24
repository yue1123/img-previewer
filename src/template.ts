import type { Ii18n } from './types'

// icons from Tabler Icons (MIT), https://tabler.io/icons
const icon = (paths: string) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`

const icons = {
	zoomIn: icon('<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M7 10l6 0"/><path d="M10 7l0 6"/><path d="M21 21l-6 -6"/>'),
	zoomOut: icon('<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M7 10l6 0"/><path d="M21 21l-6 -6"/>'),
	reset: icon('<path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/>'),
	rotateLeft: icon('<path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5"/>'),
	rotateRight: icon('<path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5"/>'),
	close: icon('<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>'),
	prev: icon('<path d="M15 6l-6 6l6 6"/>'),
	next: icon('<path d="M9 6l6 6l-6 6"/>')
}

const button = (action: keyof typeof icons, label: string, className = 'img-pre__button-item') =>
	`<button type="button" class="${className}" data-action="${action}" data-tooltip="{{${label}}}" aria-label="{{${label}}}">${icons[action]}</button>`

const divider = '<span class="img-pre__divider" aria-hidden="true"></span>'

const template: string = `
	<div class="img-pre__backdrop img-pre__animated"></div>
	<div class="img-pre__header img-pre__animated">
		<div class="img-pre__nums" aria-live="polite">
			<span class="img-pre__current-index"></span>
			<span class="img-pre__nums-delimiter">/</span>
			<span class="img-pre__total-index"></span>
		</div>
		<div class="img-pre__buttons">
			${button('zoomOut', 'ZOOM_OUT')}
			${button('zoomIn', 'ZOOM_IN')}
			${divider}
			${button('rotateLeft', 'ROTATE_LEFT')}
			${button('rotateRight', 'ROTATE_RIGHT')}
			${divider}
			${button('reset', 'RESET')}
			${button('close', 'CLOSE')}
		</div>
	</div>
	${button('prev', 'PREV', 'img-pre__nav img-pre__prev img-pre__animated')}
	${button('next', 'NEXT', 'img-pre__nav img-pre__next img-pre__animated')}
	<div class="img-pre__content-wrapper">
		<div class="img-pre__img-item img-pre__animated current-index">
			<img alt="" />
		</div>
	</div>`

// fill {{KEY}} placeholders with i18n text
export function renderTemplate(i18n: Required<Ii18n>): string {
	return template.replace(/{{(.*?)}}/g, (_, key: keyof Ii18n) => i18n[key])
}
