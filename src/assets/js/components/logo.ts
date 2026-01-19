import logoBaseCss from '../../css/components/logo-base.css?raw';

function createLogoUrl(size: 'full' | 'micro' | 'mini', theme = 'system') {
	const serializer = new XMLSerializer();
	const logoClone = document.querySelector('m-logo svg.u-logo')?.cloneNode(true) as SVGElement;
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

if (document.querySelector('m-logo')) {
	const fullLogoUrl = createLogoUrl('full');
	const miniLogoUrl = createLogoUrl('mini');
	const microLogoUrl = createLogoUrl('micro');

	document.querySelectorAll('m-logo dialog').forEach((dialog) => {
		/* eslint-disable @typescript-eslint/no-non-null-assertion */
		dialog.querySelector<HTMLAnchorElement>('a[download="full.svg"]')!.href = fullLogoUrl;
		dialog.querySelector<HTMLAnchorElement>('a[download="mini.svg"]')!.href = miniLogoUrl;
		dialog.querySelector<HTMLAnchorElement>('a[download="micro.svg"]')!.href = microLogoUrl;
		/* eslint-enable @typescript-eslint/no-non-null-assertion */
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
}
