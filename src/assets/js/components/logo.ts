import logoBaseCss from '../../css/components/logo-base.css?raw';
import { SiteSettings } from '../settings.ts';

function createLogoUrl(logoelement: HTMLElement, size: 'full' | 'micro' | 'mini', theme = 'system') {
	const serializer = new XMLSerializer();
	const logoClone = logoelement.cloneNode(true) as SVGElement;
	logoClone.querySelectorAll(`[data-theme]:not([data-theme="${theme}"], .pixelated-logo, .noise-logo, .overlay-logo)`).forEach((node) => node.remove());

	logoClone.querySelector('title')?.insertAdjacentHTML(
		'afterend',
		`<style>
			${logoBaseCss}
	</style>`
	);

	const [x = '0', y = '0', width = '100', height = '100'] = logoClone.querySelector(`svg[data-size="${size}"]`)?.getAttribute('viewBox')?.split(' ') ?? [];
	logoClone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
	logoClone.setAttribute('width', width);
	logoClone.setAttribute('height', height);

	logoClone.querySelectorAll(`[data-size]:not([data-size="${size}"])`).forEach((node) => node.remove());

	logoClone.querySelectorAll('.logo-part').forEach((part) => {
		part.setAttribute('fill', '#0080ff');
	});

	logoClone.querySelectorAll('.logo-text').forEach((part) => {
		part.setAttribute('fill', '#ff8000');
		part.setAttribute('font-family', "'Mecano-Light', 'Mecano', monospace");
		part.setAttribute('font-weight', '300');
	});

	const logoString = serializer.serializeToString(logoClone);
	const logoBlob = new Blob([`<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`, logoString], { type: 'image/svg+xml' });
	const logoUrl = URL.createObjectURL(logoBlob);

	return logoUrl;
}

if (SiteSettings.js !== 'disabled' && !customElements.get('hit-counter')) {
	document.querySelectorAll<HTMLElement>('m-logo').forEach((logoElement) => {
		const fullLogoUrl = createLogoUrl(logoElement, 'full');
		const miniLogoUrl = createLogoUrl(logoElement, 'mini');
		const microLogoUrl = createLogoUrl(logoElement, 'micro');

		/* eslint-disable @typescript-eslint/no-non-null-assertion */
		const dialog = logoElement.querySelector('dialog')!;
		dialog.querySelector<HTMLAnchorElement>('a[download="full.svg"]')!.href = fullLogoUrl;
		dialog.querySelector<HTMLAnchorElement>('a[download="mini.svg"]')!.href = miniLogoUrl;
		dialog.querySelector<HTMLAnchorElement>('a[download="micro.svg"]')!.href = microLogoUrl;
		/* eslint-enable @typescript-eslint/no-non-null-assertion */

		logoElement.addEventListener('contextmenu', (evt) => {
			const target = evt.target as HTMLElement;

			if (target.matches('m-logo, m-logo *:not(dialog, dialog *)')) {
				if (dialog) {
					evt.preventDefault();
					dialog.showPopover();
				}
			}
		}, { capture: false });
	});
}
