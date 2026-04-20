// INFO: Make sure the browser blocks IAB
import '../../components/IabEscape/iab-escape.ts';

document.addEventListener('DOMContentLoaded', async () => {
	// Global functionality
	await Promise.allSettled([
		import('../../components/EmbeddedContentError/embedded-content-errors.ts'),
		import('../../components/JsNakedDay/js-naked-day.ts'),
		import('../../components/CssNakedDay/css-naked-day.ts'),
		import('../../components/Logo/logo.ts')
	]);

	// General custom elements
	await Promise.allSettled([
		import('../../components/OldStyleButtons/old-style-buttons.ts'),
		import('../../components/SiteSettings/site-settings.ts'),
		import('../../components/Counter/counter.ts')
	]);
});
