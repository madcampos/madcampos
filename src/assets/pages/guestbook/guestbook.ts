import { SiteSettings } from '../../js/settings.ts';

interface PaginatedResponse<T = unknown> {
	data: T[];
	start: number;
	end: number;
	total: number;
	currentPage: number;
	size: number;
	lastPage: number;
	url: {
		current: string,
		prev?: string,
		next?: string,
		first?: string,
		last?: string
	};
}

interface MessageRecord {
	id: number;
	name: string;
	message: string;
	visitor_id: string;
	timestamp: string;
	country: string;
	user_agent: string;
}

const formatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

function sanitizeInlineText(unsafeString?: string) {
	if (!unsafeString) {
		return '';
	}

	const template = document.createElement('template');
	template.innerHTML = unsafeString;
	const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
	let cleanText = '';

	let currentNode = walker.nextNode();
	while (currentNode !== null) {
		cleanText += currentNode.nodeValue ?? '';

		currentNode = walker.nextNode();
	}

	return cleanText
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function inlineMarkdownRender(input: string) {
	const results = sanitizeInlineText(input)
		// Bold
		.replaceAll(/\*\*(.+?)\*\*|__(.+?)__/igu, '<strong>$1$2</strong>')
		// Italics
		.replaceAll(/\*(.+?)\*|_(.+?)_/igu, '<em>$1$2</em>')
		// Striketrough (deleted text)
		.replaceAll(/~~(.+?)~~/igu, '<del>$1</del>')
		// Underline (inserted text)
		.replaceAll(/\+\+(.+?)\+\+/igu, '<ins>$1</ins>')
		// Highlight
		.replaceAll(/[=]=(.+?)==/igu, '<mark>$1</mark>')
		// Inline code
		.replaceAll(/`(.+?)`/igu, '<code>$1</code>');

	return results;
}

// oxlint-disable typescript/no-non-null-assertion
const messageInput = document.querySelector<HTMLTextAreaElement>('#message-input')!;
const messageCountProgress = document.querySelector<HTMLProgressElement>('#word-count')!;
const messageCountText = document.querySelector<HTMLSpanElement>('#word-count-text')!;
const messageForm = document.querySelector<HTMLFormElement>('form')!;
const messageSubmitButton = document.querySelector<HTMLButtonElement>('button[type="submit"]')!;
const messageResetButton = document.querySelector<HTMLButtonElement>('button[type="reset"]')!;
const messageFeedback = document.querySelector<HTMLElement>('form-status')!;
// oxlint-enable typescript/no-non-null-assertion

function updateCharCount() {
	messageCountProgress.value = messageInput.value.length;
	messageCountProgress.textContent = messageInput.value.length === 0 ? '—' : messageInput.value.length.toString();
	messageCountText.textContent = messageCountProgress.textContent;
}

messageInput.addEventListener('input', updateCharCount);
messageInput.addEventListener('change', updateCharCount);

messageForm.addEventListener('submit', async (evt) => {
	evt.preventDefault();

	if (!(evt.target instanceof HTMLFormElement)) {
		return;
	}

	try {
		const url = evt.target.action;
		const formData = new FormData(evt.target);

		// oxlint-disable-next-line typescript/consistent-type-assertions typescript/no-unsafe-type-assertion
		formData.set('name', sanitizeInlineText(formData.get('name') as string));
		// oxlint-disable-next-line typescript/consistent-type-assertions typescript/no-unsafe-type-assertion
		formData.set('message', sanitizeInlineText(formData.get('message') as string));

		messageSubmitButton.disabled = true;
		messageResetButton.disabled = true;
		messageFeedback.hidden = true;

		const response = await fetch(new URL(new URL(url).pathname, SiteSettings.apiUrl), {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorResposne: { message: string } = await response.json();

			throw new Error(errorResposne.message);
		}

		messageFeedback.innerHTML = /* html */ `
			<span>Message sent successfully!</span>
		`;
		messageFeedback.removeAttribute('data-error');
		messageFeedback.toggleAttribute('data-success', true);
		messageFeedback.hidden = false;

		evt.target.reset();
	} catch (err) {
		messageFeedback.innerHTML = /* html */ `
			<span>${err instanceof Error ? err.message : 'Error sending message.'}</span>
		`;
		messageFeedback.removeAttribute('data-success');
		messageFeedback.toggleAttribute('data-error', true);
		messageFeedback.hidden = false;

		messageSubmitButton.disabled = false;
		messageResetButton.disabled = false;
	}
});

if (SiteSettings.js !== 'disabled') {
	messageForm.hidden = false;
}

class MessagesList extends HTMLElement implements CustomElement {
	#GUESTBOOK_URL = new URL('/api/guestbook/', SiteSettings.apiUrl).href;

	#loader = document.createElement('hr');

	#isLoading = false;
	#observer?: IntersectionObserver;

	#nextPage = 1;
	#totalPages = 1;
	// oxlint-disable-next-line no-magic-numbers
	#MAX_PAGES = 100;

	async #fecthMoreData() {
		if (this.#nextPage <= this.#totalPages && this.#nextPage <= this.#MAX_PAGES) {
			const response = await fetch(new URL(`./${this.#nextPage}`, this.#GUESTBOOK_URL));

			if (response.ok) {
				const messages: PaginatedResponse<Pick<MessageRecord, 'message' | 'name' | 'timestamp'>> = await response.json();

				this.#totalPages = messages.lastPage;
				this.#nextPage = messages.currentPage + 1;

				return messages.data;
			}
		} else {
			this.#observer?.disconnect();
			this.#observer = undefined;
		}

		return [];
	}

	#addCards(messages: Pick<MessageRecord, 'message' | 'name' | 'timestamp'>[]) {
		for (const message of messages) {
			this.#loader.insertAdjacentHTML(
				'beforebegin',
				/* html */ `
				<m-card>
					<article>
						<header>
							<card-title>
								<strong>From:</strong>
								<span>${sanitizeInlineText(message.name)}</span>
							</card-title>

							<card-subtitle>
								<time datetime="${message.timestamp}">${formatter.format(new Date(message.timestamp))}</time>
							</card-subtitle>
						</header>

						<rendered-content>${inlineMarkdownRender(message.message)}</rendered-content>
					</article>
				</m-card>
			`
			);
		}
	}

	connectedCallback() {
		this.innerHTML = /* html */ `<progress></progress>`;

		this.#observer = new IntersectionObserver(async ([entry]) => {
			if (entry?.isIntersecting && !this.#isLoading) {
				this.#isLoading = true;

				try {
					const data = await this.#fecthMoreData();

					this.#addCards(data);
				} catch (err) {
					console.error(err);
				}

				this.#isLoading = false;
			}
		}, {});

		this.#observer.observe(this.#loader);

		this.replaceChildren();
		this.insertAdjacentElement('beforeend', this.#loader);
	}

	disconnectedCallback() {
		this.#observer?.disconnect();
		this.#observer = undefined;
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('message-list')) {
	customElements.define('message-list', MessagesList);
}
