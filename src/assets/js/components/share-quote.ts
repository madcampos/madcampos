const MIN_WORDS_FOR_SHARING = 3;

document.addEventListener('selectionchange', () => {
	const segmenter = new Intl.Segmenter('en-US', { granularity: 'word' });
	const selection = document.getSelection();
	let overlay = document.querySelector<HTMLElement>('share-overlay');

	if (!selection) {
		return;
	}

	if (!overlay) {
		overlay = document.createElement('share-overlay');

		document.body.append(overlay);
	}

	if (Array.from(segmenter.segment(selection.toString())).length >= MIN_WORDS_FOR_SHARING) {
		const range = selection.getRangeAt(0);
		const { top, left, width, height } = range.getBoundingClientRect();
		const { scrollX, scrollY } = window;

		overlay.style.top = `${top + scrollY}px`;
		overlay.style.left = `${left + scrollX}px`;
		overlay.style.width = `${width}px`;
		overlay.style.height = `${height}px`;
		overlay.hidden = false;

		// TODO: complete component
		// 2. Provide url to share as text fragment
		// 3. Write to a canvas to generate a nicely formatted quote.
	} else {
		overlay.hidden = true;
	}
});
