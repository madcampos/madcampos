import type { ElementContent } from 'hast';
import type { Root } from 'mdast';
import type { ContainerDirective, LeafDirective, TextDirective } from 'mdast-util-directive';

import { visit } from 'unist-util-visit';
import { features } from 'web-features';

interface VFile {
	fail(reason: string, parentNode?: unknown): void;
}

type AllowedContainerTypes<T extends {} = {}> = T & (ContainerDirective | LeafDirective | TextDirective);

function testDirectiveType(node: { type: string, name?: string }, directiveName: string): asserts node is AllowedContainerTypes {
	const allowedDirectives = ['containerDirective', 'leafDirective', 'textDirective'];

	if (!allowedDirectives.includes(node.type)) {
		throw new Error('Invalid directive type');
	}

	if (node?.name !== directiveName) {
		throw new Error('Invalid directive name');
	}
}

function validateDirectiveType(file: VFile, node: AllowedContainerTypes, directiveType: 'container' | 'leaf' | 'text', directiveName: string) {
	// eslint-disable-next-line no-nested-ternary
	const colonNumber = directiveType === 'container' ? 'three' : directiveType === 'leaf' ? 'two' : 'one';
	const actualDirectiveType = node.type.replace('Directive', '');

	if (directiveType !== actualDirectiveType) {
		file.fail(`Unexpected ${actualDirectiveType} directive for "${directiveName}", use ${colonNumber} colons for a ${directiveType} directive.`, node);
	}
}

function validateDirectiveProperties<T extends string[]>(
	file: VFile,
	node: AllowedContainerTypes,
	expectedProperties: T
): asserts node is AllowedContainerTypes<{ attributes: Record<T[number], string> }> {
	const errors = expectedProperties.reduce<string[]>((errorList, property) => {
		if (!node.attributes?.[property]) {
			errorList.push(`Missing "${property}"${property === 'id' ? ' ("#")' : ''} on "${node.name}" directive`);
		}

		return errorList;
	}, []);

	if (errors.length > 0) {
		file.fail(`Property validation failed:\n${errors.join('\n')}`);
	}
}

function buildElement<T extends HTMLElement>(node: AllowedContainerTypes, tagName: string, attributes: Partial<T>, children?: ElementContent[]) {
	node.data ??= {};

	node.data.hName = tagName;
	node.data.hProperties = {
		...node.data.hProperties,
		...attributes
	};
	node.data.hChildren = children;
}

export function codepenEmbed() {
	return (tree: Root, file: VFile) => {
		visit(tree, (node) => {
			try {
				testDirectiveType(node, 'codepen');
				validateDirectiveType(file, node, 'leaf', 'codepen');
				validateDirectiveProperties(file, node, ['id', 'username']);

				const { id, username } = node.attributes;
				const title = node.children.map((child: { value?: string }) => child?.value ?? '').join(' ');

				buildElement<HTMLIFrameElement & { allowTransparency: boolean, credentialless: boolean }>(node, 'iframe', {
					title,
					src: `https://codepen.io/${username}/embed/preview/${id}?default-tab=result`,
					width: '300',
					height: '400',
					scrolling: 'no',
					frameBorder: 'no',
					loading: 'lazy',
					allowTransparency: true,
					allowFullscreen: true,
					credentialless: true,
					referrerPolicy: 'no-referrer',
					sandbox: 'allow-forms allow-scripts allow-same-origin' as unknown as DOMTokenList
				}, [{
					type: 'raw',
					value:
						`See the Pen <a href="https://codepen.io/${username}/pen/${id}">${title}</a> by <a href="https://codepen.io/${username}">@${username}</a> on <a href="https://codepen.io">CodePen</a>.`
				}]);
			} catch {
				// Ignore node
			}
		});
	};
}

export function youtubeEmbed() {
	return (tree: Root, file: VFile) => {
		visit(tree, (node) => {
			try {
				testDirectiveType(node, 'youtube');
				validateDirectiveType(file, node, 'leaf', 'youtube');
				validateDirectiveProperties(file, node, ['id']);

				const { id } = node.attributes;

				const title = node.children.map((child: { value?: string }) => child?.value ?? '').join(' ');

				buildElement<HTMLIFrameElement & { allowTransparency: boolean, credentialless: boolean, csp: string }>(node, 'iframe', {
					title,
					src: `https://www.youtube-nocookie.com/embed/${id}`,
					width: '300',
					height: '400',
					frameBorder: 'no',
					scrolling: 'no',
					loading: 'lazy',
					allowTransparency: true,
					allowFullscreen: true,
					credentialless: true,
					referrerPolicy: 'no-referrer',
					sandbox: 'allow-scripts allow-same-origin' as unknown as DOMTokenList,
					allow:
						"accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; battery 'none'; browsing-topics 'none'; camera 'none'; display-capture 'none'; domain-agent 'none'; document-domain 'none'; encrypted-media 'none'; execution-while-not-rendered 'none'; execution-while-out-of-viewport ''; gamepad 'none'; geolocation 'none'; gyroscope 'none'; hid 'none'; identity-credentials-get 'none'; idle-detection 'none'; local-fonts 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; otp-credentials 'none'; payment 'none'; picture-in-picture 'none'; publickey-credentials-create 'none'; publickey-credentials-get 'none'; screen-wake-lock 'none'; serial 'none'; speaker-selection 'none'; usb 'none'; window-management 'none'; xr-spatial-tracking 'none'",
					csp: 'sandbox allow-scripts allow-same-origin;'
				});
			} catch {
				// Ignore node
			}
		});
	};
}

export function baselineInfo() {
	return (tree: Root, file: VFile) => {
		const baselineStatus = new Map<'high' | 'low' | false | undefined, string>([
			['high', '<strong>Baseline</strong> Widely Available'],
			['low', '<strong>Baseline</strong> Newly Available'],
			[false, 'Limited Availability'],
			[undefined, '<strong>No data on this feature</strong>']
		]);
		const baselineIcon = new Map<'high' | 'low' | false | undefined, string>([
			[
				'high',
				'<svg viewBox="0 0 36 20"><g fill="light-dark(#1ea446, #1ea446)"><path d="M18 8L20 10L18 12L16 10L18 8Z"/><path d="M26 0L28 2L10 20L0 10L2 8L10 16L26 0Z"/></g><g fill="light-dark(#c4eed0, #125225)"><path d="M28 2L26 4L32 10L26 16L22 12L20 14L26 20L36 10L28 2Z"/><path d="M10 0L2 8L4 10L10 4L14 8L16 6L10 0Z"/></g></svg>'
			],
			[
				'low',
				'<svg viewBox="0 0 36 20"><path fill="light-dark(#a8c7fa, #2d509e)" d="m10 0 2 2-2 2-2-2 2-2Zm4 4 2 2-2 2-2-2 2-2Zm16 0 2 2-2 2-2-2 2-2Zm4 4 2 2-2 2-2-2 2-2Zm-4 4 2 2-2 2-2-2 2-2Zm-4 4 2 2-2 2-2-2 2-2Zm-4-4 2 2-2 2-2-2 2-2ZM6 4l2 2-2 2-2-2 2-2Z"/><path fill="light-dark(#1b6ef3, #4185ff)" d="m26 0 2 2-18 18L0 10l2-2 8 8L26 0Z"/></svg>'
			],
			[
				false,
				'<svg viewBox="0 0 36 20"><g fill="light-dark(#f09409, #f09409)"><path d="M10 0L16 6L14 8L8 2L10 0Z"/><path d="M22 12L20 14L26 20L28 18L22 12Z"/><path d="M26 0L28 2L10 20L8 18L26 0Z"/></g><g fill="light-dark(#c6c6c6, #565656)"><path d="M8 2L10 4L4 10L10 16L8 18L0 10L8 2Z"/><path d="M28 2L36 10L28 18L26 16L32 10L26 4L28 2Z"/></g></svg>'
			],
			[
				undefined,
				'<svg viewBox="0 0 36 20"><g fill="light-dark(#909090, #666666)"><path d="M18 8L20 10L18 12L16 10L18 8Z"/><path d="M28 2L26 4L32 10L26 16L22 12L20 14L26 20L36 10L28 2Z"/><path d="M10 0L2 8L4 10L10 4L14 8L16 6L10 0Z"/><path d="M26 0L28 2L10 20L0 10L2 8L10 16L26 0Z"/></g></svg>'
			]
		]);
		const browserNames = new Map([
			['chrome', 'Chrome on Desktop'],
			['chrome_android', 'Chrome on Android'],
			['edge', 'Edge'],
			['firefox', 'Firefox'],
			['firefox_android', 'Firefox on android'],
			['safari', 'Safari on Desktop'],
			['safari_ios', 'Safari on iOS']
		]);

		visit(tree, (node) => {
			try {
				testDirectiveType(node, 'baseline');
				validateDirectiveType(file, node, 'leaf', 'baseline');
				validateDirectiveProperties(file, node, ['id']);

				const { id = '' } = node.attributes;
				const {
					name = id,
					description_html: description = 'No data is available on this feature.',
					status,
					discouraged
				} = features[id] ?? {};
				const baselineDate = status?.baseline_high_date ?? status?.baseline_low_date;
				const supportedBrowsers = Object.entries(status?.support ?? {}).map(([browser, version]) =>
					`<span id="${browser}">${browserNames.get(browser)} Version: ${version}</span>`
				).join('');

				buildElement<HTMLElement & { feature: string, discouraged: 'false' | 'true' }>(node, 'baseline-support', {
					feature: id,
					discouraged: discouraged ? 'true' : 'false'
				}, [{
					type: 'raw',
					value: `
						<template shadowrootmode="open">
							<details>
								<summary>
									<span id="feature-name">${name}</span>
									<aside>
										<div id="baseline-status">
											<span id="baseline-icon">${baselineIcon.get(status?.baseline)}</span>
											<span id="baseline-status">${baselineStatus.get(status?.baseline)}</span>
											<span id="baseline-status-date">${baselineDate ? `Since ${new Date(baselineDate).getFullYear()}` : ''}</span>
										</div>
										<div id="browser-support">
											${supportedBrowsers}
										</div>
									</aside>
								</summary>
								<p id="feature-description">${description}</p>
							</details>
						</template>
					`.trim().replaceAll(/\n\t+/giu, '')
				}]);
			} catch {
				// Ignore node
			}
		});
	};
}
