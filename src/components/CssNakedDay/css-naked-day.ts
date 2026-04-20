import { SiteSettings } from '../../assets/js/settings.ts';

if (SiteSettings.css === 'disabled') {
	document.querySelectorAll('style, link[rel~="stylesheet"]').forEach((css) => css.remove());
	document.querySelectorAll('[style]').forEach((element) => element.removeAttribute('style'));
}
