import './js-naked-day.js';

document.addEventListener('DOMContentLoaded', async () => {
	if (!document.body.classList.contains('js-denabled')) {
		return;
	}

	await import('./css-naked-day.js');
	await import('./iab-escape.js');
});
