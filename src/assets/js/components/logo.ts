/* eslint-disable @typescript-eslint/no-non-null-assertion */

import logoBaseCss from '../../css/themes/logo/base.css?raw';
import logoSystemCss from '../../css/themes/logo/system.css?raw';

function createLogoUrl(size: 'full' | 'micro' | 'mini', theme = 'system') {
	const serializer = new XMLSerializer();
	const logoClone = document.querySelector('m-logo svg.u-logo')?.cloneNode(true) as SVGElement;
	logoClone.querySelectorAll(`[data-theme]:not([data-theme="${theme}"], .pixelated-logo, .noise-logo, .overlay-logo)`).forEach((node) => node.remove());

	logoClone.querySelector('title')?.insertAdjacentHTML(
		'afterend',
		`<style>
		${logoBaseCss}

		${logoSystemCss}
	</style>`
	);

	const [x = '0', y = '0', width = '100', height = '100'] = logoClone.querySelector(`svg[data-size="${size}"]`)?.getAttribute('viewBox')?.split(' ') ?? [];
	logoClone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
	logoClone.setAttribute('width', width);
	logoClone.setAttribute('height', height);

	logoClone.querySelectorAll(`[data-size]:not([data-size="${size}"])`).forEach((node) => node.remove());

	const logoString = serializer.serializeToString(logoClone);
	const logoBlob = new Blob([logoString], { type: 'image/svg+xml' });
	const logoUrl = URL.createObjectURL(logoBlob);

	return logoUrl;
}

const fullLogoUrl = createLogoUrl('full');
const miniLogoUrl = createLogoUrl('mini');
const microLogoUrl = createLogoUrl('micro');

document.querySelectorAll('m-logo dialog').forEach((dialog) => {
	dialog.querySelector<HTMLAnchorElement>('a[download="full.svg"]')!.href = fullLogoUrl;
	dialog.querySelector<HTMLAnchorElement>('a[download="mini.svg"]')!.href = miniLogoUrl;
	dialog.querySelector<HTMLAnchorElement>('a[download="micro.svg"]')!.href = microLogoUrl;
});

document.addEventListener('contextmenu', (evt) => {
	const target = evt.target as HTMLElement;

	if (target.matches('m-logo, m-logo *:not(dialog, dialog *)')) {
		const dialog = target.closest('m-logo')?.querySelector('dialog');

		if (dialog) {
			evt.preventDefault();
			dialog.showPopover();
		}
	}
}, { capture: false });
