// shared script of the demo pages, page specific text comes from data-* on <body>
;(function () {
	var body = document.body
	var hideToggle = document.getElementById('hide-original')
	var options = {
		imageZoom: { step: 1 },
		style: { modalOpacity: 0.85 },
		bubblingLevel: 1,
		// browsers may restore the checkbox state on reload
		hideOriginal: hideToggle.checked,
		onHide: stop
	}
	if (body.dataset.lang === 'en') {
		options.i18n = {
			RESET: 'Reset',
			ROTATE_LEFT: 'Rotate left',
			ROTATE_RIGHT: 'Rotate right',
			CLOSE: 'Close',
			NEXT: 'Next',
			PREV: 'Previous',
			ZOOM_IN: 'Zoom in',
			ZOOM_OUT: 'Zoom out'
		}
	}
	var previewer = new ImgPreviewer('#app', options)
	var timer = null

	// options are fixed per instance, so rebuild the previewer to apply the toggle
	function toggleHideOriginal(event) {
		// destroy() does not fire onHide, stop the slideshow here
		stop()
		previewer.destroy()
		options.hideOriginal = event.currentTarget.checked
		previewer = new ImgPreviewer('#app', options)
	}

	document.getElementById('version').textContent = 'v' + ImgPreviewer.version

	function stop() {
		clearInterval(timer)
		timer = null
	}

	function play() {
		stop()
		var index = 0
		previewer.show(index)
		timer = setInterval(function () {
			index = index < previewer.getTotalIndex() ? index + 1 : 0
			previewer.show(index)
		}, 2000)
	}

	function add(event) {
		var button = event.currentTarget
		var img = new Image()
		button.disabled = true
		img.alt = ''
		img.src = 'https://picsum.photos/seed/' + Date.now() + '/800/600'
		img.onload = function () {
			document.getElementById('app').appendChild(img)
			previewer.update()
			button.disabled = false
		}
		img.onerror = function () {
			button.disabled = false
		}
	}

	function copy(event) {
		var button = event.currentTarget
		var text = button.dataset.copy
		if (!navigator.clipboard) return
		navigator.clipboard.writeText(text).then(function () {
			var label = button.textContent
			button.textContent = button.dataset.done
			setTimeout(function () {
				button.textContent = label
			}, 1500)
		})
	}

	document.getElementById('play').addEventListener('click', play)
	document.getElementById('add').addEventListener('click', add)
	document.getElementById('copy').addEventListener('click', copy)
	hideToggle.addEventListener('change', toggleHideOriginal)
})()
