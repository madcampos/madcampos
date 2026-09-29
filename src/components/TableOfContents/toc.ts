import { loadComponentCss } from '../../assets/js/custom-element.ts';
import styles from './toc.css?url';

export class TableOfContents extends HTMLElement implements CustomElement {
	static observedAttributes = ['root', 'toc-title'];
	#observer?: MutationObserver;

	readonly #id = crypto.randomUUID();

	set rootSelector(newValue: string | null) {
		if (!newValue) {
			this.removeAttribute('root');
			return;
		}

		this.setAttribute('root', newValue);
	}

	get rootSelector(): string {
		return this.getAttribute('root') ?? 'main';
	}

	set tocTitle(newValue: string | null) {
		if (!newValue) {
			this.removeAttribute('toc-title');
			return;
		}

		this.setAttribute('toc-title', newValue);
	}

	get tocTitle(): string {
		return this.getAttribute('toc-title') ?? 'Table of Contents';
	}

	#escapeHtml(text: string) {
		const template = document.createElement('template');

		template.innerHTML = text;

		[...template.content.querySelectorAll(':not(b, i, em, strong, code, s, u)')].forEach((element) => {
			if (element.matches('a:not(.header-link)')) {
				element.insertAdjacentHTML('afterend', element.innerHTML);
			}

			element.remove();
		});

		return template.innerHTML.trim();
	}

	#setHeadingId(heading: HTMLHeadingElement, prevHeadingId: string) {
		if (heading.id) {
			return;
		}

		if (heading.innerText) {
			const textSlug = heading.innerText
				.toLowerCase()
				.trim()
				.replace(/[^\p{L}\p{N}\s_-]/gu, '')
				.replace(/\s+/gu, '-')
				.replace(/-+/gu, '-')
				.replace(/^-+|-+$/gu, '');
			heading.id = `${prevHeadingId ? `${prevHeadingId}--` : ''}${textSlug}`;
		} else {
			heading.id = `header-${Math.trunc(Math.random() * 1000000).toString(16)}`;
		}
	}

	#addHeadingLink(heading: HTMLHeadingElement) {
		if (heading.querySelector('a')) {
			return;
		}

		heading.insertAdjacentHTML(
			'beforeend',
			/* html */ `
				<a class="header-link" href="#${heading.id}">
					<sr-only>(Link to here)</sr-only>
					<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
						<use href="#toc-icon-link" width="24" height="24" />
					</svg>
				</a>
			`
		);
	}

	#buildHeadingLists(headingList: HTMLHeadingElement[], prevHeadingId = '') {
		let nestedHeadingList = '';

		if (headingList.length > 0) {
			let curIndex = 0;

			do {
				const curHeading = headingList[curIndex];

				if (!curHeading) {
					continue;
				}

				const headingLabel = this.#escapeHtml(curHeading.innerHTML);

				this.#setHeadingId(curHeading, prevHeadingId);
				this.#addHeadingLink(curHeading);

				// oxlint-disable-next-line no-loop-func
				const nextSameLevelIndex = headingList.findIndex((heading, index) => index > curIndex && heading.tagName === curHeading.tagName);

				// Last item
				if (nextSameLevelIndex === -1 && curHeading === headingList.at(-1)) {
					nestedHeadingList += /* html */ `<li><a href="#${curHeading.id}">${headingLabel}</a></li>`;
					break;
				}

				// Iterate next item
				if (nextSameLevelIndex === curIndex + 1) {
					nestedHeadingList += /* html */ `<li><a href="#${curHeading.id}">${headingLabel}</a></li>`;
					curIndex += 1;
				}

				// Iterate a portion of the array
				if (nextSameLevelIndex > curIndex + 1) {
					nestedHeadingList += /* html */ `
					<li>
						<details open>
							<summary><a href="#${curHeading.id}">${headingLabel}</a></summary>
							<ol>
								${this.#buildHeadingLists(headingList.slice(curIndex + 1, nextSameLevelIndex), curHeading.id)}
							</ol>
						</details>
					</li>
				`;
					curIndex = nextSameLevelIndex;
				}

				// Iterate to the end of the array
				if (nextSameLevelIndex === -1) {
					nestedHeadingList += /* html */ `
					<li>
						<details open>
							<summary><a href="#${curHeading.id}">${headingLabel}</a></summary>
							<ol>
								${this.#buildHeadingLists(headingList.slice(curIndex + 1), curHeading.id)}
							</ol>
						</details>
					</li>
				`;
					curIndex = headingList.length;
				}
			} while (curIndex < headingList.length);
		}

		return nestedHeadingList;
	}

	#renderTocList() {
		const root = document.querySelector(this.rootSelector);

		if (!root) {
			return '';
		}

		const headings = [...root.querySelectorAll<HTMLHeadingElement>(':is(h2, h3, h4, h5, h6):not([data-ignore-toc])')];
		const filteredHeadings = headings.filter((heading) => !heading.closest('table-of-contents') && !heading.closest('[data-ignore-toc]'));

		if (filteredHeadings.length === 0) {
			return /* html */ `<p>No headings found.</p>`;
		}

		return /* html */ `
			<ol>
				${this.#buildHeadingLists(filteredHeadings)}
			</ol>
		`;
	}

	#render() {
		const tocList = this.#renderTocList();

		this.innerHTML = /* html */ `
			<button
				type="button"
				popoveraction="open"
				popovertarget="toc-dialog-${this.#id}"
			>
				<sr-only>Open ${this.tocTitle}</sr-only>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
					<use href="#toc-icon-open" width="24" height="24" />
				</svg>
			</button>

			<dialog
				id="toc-dialog-${this.#id}"
				popover
			>
				<header>
					<h2>${this.tocTitle}</h2>
					<button
						type="button"
						popoveraction="close"
						popovertarget="toc-dialog-${this.#id}"
					>
						<sr-only>Close ${this.tocTitle}</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#toc-icon-close" width="24" height="24" />
						</svg>
					</button>
				</header>
				<dialog-content>
					${tocList}
				</dialog-content>
			</dialog>
		`;
	}

	async connectedCallback() {
		await loadComponentCss('table-of-contents', styles);

		this.#render();

		const dialog = this.querySelector('dialog');
		dialog?.addEventListener('click', (evt) => {
			if (!(evt.target instanceof HTMLAnchorElement)) {
				return;
			}

			dialog.hidePopover();
		}, { passive: true });
	}

	disconnectedCallback() {
		this.#observer?.disconnect();
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'root':
				this.rootSelector = newValue;
				break;
			case 'toc-title':
				this.tocTitle = newValue;
				break;
			default:
		}
	}
}

if (!customElements.get('table-of-contents')) {
	customElements.define('table-of-contents', TableOfContents);
}
