// INFO: Make sure the browser blocks IAB
import './components/iab-escape.ts';

document.addEventListener('DOMContentLoaded', async () => {
	// Global functionality
	await Promise.allSettled([
		import('./components/embedded-content-errors.ts'),
		import('./components/js-naked-day.ts'),
		import('./components/css-naked-day.ts'),
		import('./components/logo.ts')
	]);

	// General custom elements
	await Promise.allSettled([
		import('./components/old-style-buttons.ts'),
		import('./components/site-settings.ts'),
		import('./components/counter.ts')
	]);
});
