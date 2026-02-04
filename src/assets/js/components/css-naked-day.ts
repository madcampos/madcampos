import { SiteSettings } from '../settings.ts';

if (SiteSettings.css === 'disabled') {
	document.querySelectorAll('style, link[rel~="stylesheet"]').forEach((css) => css.remove());
	document.querySelectorAll('[style]').forEach((element) => element.removeAttribute('style'));
}
