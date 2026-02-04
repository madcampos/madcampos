import { SiteSettings } from '../settings.ts';

if (SiteSettings.js !== 'disabled') {
	document.body.classList.add('js-enabled');
}
