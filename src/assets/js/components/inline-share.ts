import { SiteSettings } from '../settings.ts';

export class InlineShare extends HTMLElement implements CustomElement {
	readonly #MIN_WORDS_FOR_SHARING = 3;
	readonly #MAX_WORDS_FOR_SHARING = 30;
	readonly #TEXT_BOX_WIDTH = 700;
	readonly #WORDS_FOR_FRAGMENT_PART = 3;
	readonly #MIN_WORDS_FOR_FRAGMENT_SPLIT = 45;
	readonly #MAX_WORDS_FOR_FRAGMENT_INFIX = 15;

	#id: string;

	#segmenter = new Intl.Segmenter('en-US', { granularity: 'word' });
	#overlay: HTMLElement;
	#canvas: HTMLCanvasElement;
	#canvasContext: CanvasRenderingContext2D;
	#svgQuoteText: SVGTextElement;
	#svgTitleText: SVGTextElement;
	#svgTestText: SVGTextElement;
	#quoteSvg: SVGElement;

	constructor() {
		super();

		this.#id = Math.trunc(Math.random() * 100000).toString(16);
		this.hidden = true;

		this.innerHTML = `
			<share-overlay></share-overlay>
			<button type="button" popovertarget="dialog-${this.#id}" popoveraction="open">
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
					<use href="#share-icon-share" width="24" height="24" />
				</svg>
				<span>Share quote</span>
			</button>
			<dialog id="dialog-${this.#id}" popover>
				<header>
					<h2>Share quote</h2>
					<button type="button" popovertarget="dialog-${this.#id}" popoveraction="close">
						<sr-only>Close quote sharing</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-close" width="24" height="24" />
						</svg>
					</button>
				</header>
				<dialog-content>
					<canvas hidden></canvas>
					<svg
						viewBox="0 0 1024 1024"
						class="inline-share-quote-svg"
						width="1024"
						height="1024"
					>
						<defs>
							<linearGradient id="bg-gradient-${this.#id}" x1="100%" x2="80%" y2="100%">
								<stop offset="50%" stop-color="#0080ff" />
								<stop offset="100%" stop-color="#ff8000" />
							</linearGradient>
						</defs>
						<rect x="0" y="0" width="100%" height="100%" rx="20" fill="url(#bg-gradient-${this.#id})" />
						<text fill="transparent" class="inline-share-test-text"></text>
						<text
							x="50%"
							y="10%"
							text-anchor="middle"
							font-family="'Mecano', monospace"
							font-size="45"
							fill="white"
							class="inline-share-quote-text"
						></text>
						<text
							x="10%"
							y="80%"
							text-anchor="start"
							font-family="'Mecano', monospace"
							font-size="35"
							font-style="italic"
							fill="color-mix(in srgb, white, transparent 20%)"
						>&mdash; Marco Campos</text>
						<text
							x="10%"
							y="82%"
							text-anchor="start"
							font-family="'Mecano', monospace"
							font-size="25"
							font-style="italic"
							fill="color-mix(in srgb, white, transparent 20%)"
							class="inline-share-title-text"
						></text>
					</svg>
				</dialog-content>
				<footer>
					<button type="button" class="inline-share-os">
						<sr-only>Share Quote</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-share" width="24" height="24" />
						</svg>
					</button>
					<button type="button" class="inline-share-copy">
						<sr-only>Copy Link to Quote</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-copy" width="24" height="24" />
						</svg>
					</button>
					<button type="button" class="inline-share-email">
						<sr-only>Share via Email</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-email" width="24" height="24" />
						</svg>
					</button>
					<button type="button" class="inline-share-download">
						<sr-only>Download quote</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-download" width="24" height="24" />
						</svg>
					</button>
				</footer>
			</dialog>
		`;

		/* eslint-disable @typescript-eslint/no-non-null-assertion */
		this.#overlay = this.querySelector('share-overlay')!;
		this.#canvas = this.querySelector('canvas')!;
		this.#canvasContext = this.#canvas.getContext('2d')!;

		this.#quoteSvg = this.querySelector('svg.inline-share-quote-svg')!;
		this.#svgQuoteText = this.querySelector('text.inline-share-quote-text')!;
		this.#svgTitleText = this.querySelector('text.inline-share-title-text')!;
		this.#svgTestText = this.querySelector('text.inline-share-test-text')!;
		/* eslint-enable @typescript-eslint/no-non-null-assertion */

		if (!('share' in navigator)) {
			this.querySelector('button.inline-share-os')?.toggleAttribute('hidden', true);
		}

		if (!('fragmentDirective' in document)) {
			this.querySelector('button.inline-share-copy')?.toggleAttribute('hidden', true);
		}
	}

	#resizeCanvas(width: number, height: number) {
		this.#canvas.width = width * window.devicePixelRatio;
		this.#canvas.height = height * window.devicePixelRatio;
	}

	#drawText(text: string, textElement: SVGTextElement) {
		const segments = Array.from(this.#segmenter.segment(text));

		this.#svgTestText.textContent = '';
		textElement.textContent = '';

		this.#svgTestText.setAttribute('text-anchor', textElement.getAttribute('text-anchor') ?? 'start');
		this.#svgTestText.setAttribute('font-family', textElement.getAttribute('font-family') ?? 'sans-serif');
		this.#svgTestText.setAttribute('font-size', textElement.getAttribute('font-size') ?? '45');
		this.#svgTestText.setAttribute('font-weight', textElement.getAttribute('font-weight') ?? 'normal');
		this.#svgTestText.setAttribute('font-style', textElement.getAttribute('font-style') ?? 'normal');

		const lines: string[] = [];
		let currentLine = '';
		let currentWidth = 0;
		let currentWords = 0;

		for (const segment of segments) {
			if (segment.isWordLike) {
				currentWords += 1;
			}

			if (currentWords > this.#MAX_WORDS_FOR_SHARING) {
				currentLine = `${currentLine.trim()}...`;
				break;
			}

			if (segment.segment === '\n') {
				lines.push(currentLine.trim());
				currentLine = '';
				currentWidth = 0;
			} else {
				this.#svgTestText.textContent = segment.segment;

				const wordWidth = this.#svgTestText.getComputedTextLength();

				if (currentWidth + wordWidth >= this.#TEXT_BOX_WIDTH) {
					lines.push(currentLine.trim());
					currentLine = segment.segment;
					currentWidth = wordWidth;
				} else {
					currentLine += segment.segment;
					currentWidth += wordWidth;
				}
			}
		}

		if (currentLine) {
			lines.push(currentLine.trim());
		}

		const x = textElement.getAttribute('x') ?? '0';
		for (const line of lines) {
			textElement.insertAdjacentHTML('beforeend', `<tspan dy="1lh" x="${x}">${line}</tspan>`);
		}
	}

	#renderToCanvas(text: string) {
		this.#quoteSvg.toggleAttribute('hidden', false);
		this.#canvas.hidden = true;

		this.#drawText(text, this.#svgQuoteText);
		this.#drawText(document.querySelector('h1')?.textContent ?? '', this.#svgTitleText);

		const img = new Image();

		img.onload = () => {
			this.#canvasContext.drawImage(img, 0, 0, this.#canvas.width, this.#canvas.height);
			this.#quoteSvg.toggleAttribute('hidden', true);
			this.#canvas.hidden = false;
		};

		const svgData = new XMLSerializer().serializeToString(this.#quoteSvg);
		const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
		img.src = URL.createObjectURL(svgBlob);
	}

	#resizeOverlay(range: Range) {
		const { top, left, width, height } = range.getBoundingClientRect();
		const { scrollX, scrollY } = window;

		this.#overlay.style.setProperty('--overlay-top', `${top + scrollY}px`);
		this.#overlay.style.setProperty('--overlay-left', `${left + scrollX}px`);
		this.#overlay.style.setProperty('--overlay-width', `${width}px`);
		this.#overlay.style.setProperty('--overlay-height', `${height}px`);
	}

	#handleSelectionChange() {
		if (this.querySelector('dialog')?.matches(':popover-open')) {
			return;
		}

		this.hidden = true;

		const selection = document.getSelection();

		if (!selection) {
			return;
		}

		if (selection.rangeCount < 1) {
			return;
		}

		const range = selection.getRangeAt(0);
		const ancestor = range.commonAncestorContainer;
		const isRenderedContent = (ancestor as Element)?.matches?.('rendered-content') ?? false;
		const isInsideRenderedContent = Boolean(ancestor.parentElement?.closest('rendered-content'));

		if (!isRenderedContent && !isInsideRenderedContent) {
			return;
		}

		const isCodeBlock = (ancestor as Element)?.matches?.('code-wrapper') ?? false;
		const isInsideCodeBlock = Boolean(ancestor.parentElement?.closest('code-wrapper'));

		if (isCodeBlock || isInsideCodeBlock) {
			return;
		}

		const words = Array.from(this.#segmenter.segment(range.toString())).filter(({ isWordLike }) => isWordLike);
		if (words.length >= this.#MIN_WORDS_FOR_SHARING) {
			this.#resizeOverlay(range);

			this.hidden = false;
		} else {
			this.hidden = true;
		}
	}

	#handleDialogToggle(evt: ToggleEvent) {
		if (evt.newState === 'open') {
			const selection = document.getSelection();
			const range = selection?.getRangeAt(0);

			this.#canvasContext.imageSmoothingEnabled = true;
			this.#canvasContext.imageSmoothingQuality = 'high';

			this.#resizeCanvas(1024, 1024);

			this.#renderToCanvas(range?.toString() ?? '');
		}
	}

	async #getCanvasBlob() {
		return new Promise<Blob>((resolve, reject) => {
			this.#canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error('Unable to create blob from canvas'));
						return;
					}

					resolve(blob);
				},
				'image/jpeg',
				1
			);
		});
	}

	#generateTextFragmentFromSelection(range: Range) {
		const textUrl = new URL(document.location.href);
		const selectionText = range.toString();
		const segments = Array.from(this.#segmenter.segment(selectionText)).map(({ segment }) => segment);

		if (segments.length <= this.#MAX_WORDS_FOR_FRAGMENT_INFIX) {
			const ancestor = range.commonAncestorContainer;
			const fullText = ancestor.textContent ?? '';
			const selectionStart = fullText.indexOf(selectionText);
			const textBefore = fullText.substring(0, selectionStart);
			const textAfter = fullText.substring(selectionStart + selectionText.length);

			const prefixSegments = Array.from(this.#segmenter.segment(textBefore))
				.slice(-this.#WORDS_FOR_FRAGMENT_PART)
				.map(({ segment }) => segment);

			const suffixSegments = Array.from(this.#segmenter.segment(textAfter))
				.slice(0, this.#WORDS_FOR_FRAGMENT_PART)
				.map(({ segment }) => segment);

			const encodedPrefix = prefixSegments.length > 0
				? `${encodeURIComponent(prefixSegments.join('').trim()).replaceAll('-', '%2D')}-,`
				: '';
			const encodedSuffix = suffixSegments.length > 0
				? `,-${encodeURIComponent(suffixSegments.join('').trim()).replaceAll('-', '%2D')}`
				: '';
			const encodedSegments = encodeURIComponent(segments.join('').trim()).replaceAll('-', '%2D');
			textUrl.hash = `#:~:text=${encodedPrefix}${encodedSegments}${encodedSuffix}`;
		} else if (segments.length >= this.#MIN_WORDS_FOR_FRAGMENT_SPLIT) {
			const startSegments = segments.slice(0, this.#WORDS_FOR_FRAGMENT_PART);
			const endSegments = segments.slice(-this.#WORDS_FOR_FRAGMENT_PART);
			const encodedStart = encodeURIComponent(startSegments.join('').trim()).replaceAll('-', '%2D');
			const encodedEnd = encodeURIComponent(endSegments.join('').trim()).replaceAll('-', '%2D');

			textUrl.hash = `#:~:text=${encodedStart},${encodedEnd}`;
		} else {
			const encodedSegments = encodeURIComponent(segments.join('').trim()).replaceAll('-', '%2D');
			textUrl.hash = `#:~:text=${encodedSegments}`;
		}

		return textUrl;
	}

	async #handleButtonClick(evt: MouseEvent) {
		const target = evt.target as HTMLElement;

		if (!target.matches('button')) {
			return;
		}

		const url = window.location.href;
		const title = document.querySelector<HTMLElement>('h1')?.innerText ?? '';
		const description = document.getSelection()?.getRangeAt(0).toString() ?? document.querySelector<HTMLElement>('meta[name="description"]')?.getAttribute('content') ??
			'Check out this page!';
		const file = new File([await this.#getCanvasBlob()], 'quote.jpg', { type: 'image/jpeg' });

		switch (target.className) {
			case 'inline-share-os':
				await navigator.share({
					url,
					title,
					text: description,
					files: [file]
				});
				break;
			case 'inline-share-copy':
				{
					const selection = document.getSelection()?.getRangeAt(0);

					if (selection) {
						const textUrl = this.#generateTextFragmentFromSelection(selection);
						await navigator.clipboard.writeText(textUrl.href);
					}
				}
				break;
			case 'inline-share-email':
				{
					const subject = encodeURIComponent(title);
					const body = encodeURIComponent(`${description}\n${url}`);

					window.open(`mailto:?subject=${subject}&body=${body}`);
				}
				break;
			case 'inline-share-download':
				{
					const link = document.createElement('a');

					link.href = URL.createObjectURL(file);
					link.download = 'quote.jpg';

					document.body.appendChild(link);
					link.click();

					link.remove();
				}
				break;
			default:
		}
	}

	handleEvent(evt: Event) {
		if (evt.type === 'selectionchange') {
			this.#handleSelectionChange();
			return;
		}

		if (evt instanceof ToggleEvent) {
			this.#handleDialogToggle(evt);
			return;
		}

		if (evt instanceof MouseEvent) {
			void this.#handleButtonClick(evt);
		}
	}

	connectedCallback() {
		document.addEventListener('selectionchange', this);
		this.querySelector('dialog')?.addEventListener('toggle', this);
		this.addEventListener('click', this);
	}

	disconnectedCallback() {
		document.removeEventListener('selectionchange', this);
		this.querySelector('dialog')?.removeEventListener('toggle', this);
		this.addEventListener('click', this);
	}
}

const isCssAnchorSupported = CSS.supports('anchor-name: --share-overlay');
const isJsenabled = SiteSettings.js !== 'disabled';
const isComponentDefined = Boolean(customElements.get('inline-share'));
if (isCssAnchorSupported && isJsenabled && !isComponentDefined) {
	customElements.define('inline-share', InlineShare);
}
