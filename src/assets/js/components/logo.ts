/* eslint-disable @typescript-eslint/no-non-null-assertion */

// TODO: add styles to logos
// TODO: fix logo as proper xml svg

const serializer = new XMLSerializer();
const logoClone = document.querySelector('m-logo svg.u-logo')?.cloneNode(true) as SVGElement;
logoClone.querySelectorAll('[data-theme]:not([data-theme="system"])').forEach((node) => node.remove());

const fullLogo = logoClone.cloneNode(true) as SVGElement;
fullLogo.querySelectorAll('[data-size]:not([data-size="full"])').forEach((node) => node.remove());
const fullLogoUrl = URL.createObjectURL(new Blob([serializer.serializeToString(fullLogo)], { type: 'image/svg+xml' }));

const miniLogo = logoClone.cloneNode(true) as SVGElement;
miniLogo.querySelectorAll('[data-size]:not([data-size="mini"])').forEach((node) => node.remove());
const miniLogoUrl = URL.createObjectURL(new Blob([serializer.serializeToString(miniLogo)], { type: 'image/svg+xml' }));

const microLogo = logoClone.cloneNode(true) as SVGElement;
microLogo.querySelectorAll('[data-size]:not([data-size="micro"])').forEach((node) => node.remove());
const microLogoUrl = URL.createObjectURL(new Blob([serializer.serializeToString(microLogo)], { type: 'image/svg+xml' }));

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
