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

const formatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

class MessagesList extends HTMLElement implements CustomElement {
	#GUESTBOOK_URL = new URL('/api/guestbook/', SiteSettings.apiUrl).href;

	#loader = document.createElement('hr');

	#isLoading = false;
	#observer?: IntersectionObserver;

	#nextPage = 1;
	#totalPages = 1;
	#MAX_PAGES = 100;

	async #fecthMoreData() {
		if (this.#nextPage <= this.#totalPages && this.#nextPage <= this.#MAX_PAGES) {
			const response = await fetch(new URL(`./${this.#nextPage}`, this.#GUESTBOOK_URL));

			if (response.ok) {
				const messages: PaginatedResponse<Pick<MessageRecord, 'message' | 'name' | 'timestamp'>> = await response.json();

				this.#totalPages = messages.lastPage;
				this.#nextPage = messages.currentPage < messages.lastPage ? messages.currentPage + 1 : messages.lastPage;

				return messages.data;
			}
		}

		return [];
	}

	#addCards(messages: Pick<MessageRecord, 'message' | 'name' | 'timestamp'>[]) {
		for (const message of messages) {
			const messageSpan = document.createElement('span');

			messageSpan.innerText = message.message;

			this.#loader.insertAdjacentHTML(
				'beforebegin',
				/* html */ `
				<m-card>
					<article>
						<header>
							<card-title>${message.name}</card-title>

							<card-subtitle>
								<time datetime="${message.timestamp}">${formatter.format(new Date(message.timestamp))}</time>
							</card-subtitle>
						</header>

						<rendered-content>
							${messageSpan.innerHTML}
						</rendered-content>
					</article>
				</m-card>
			`
			);
		}
	}

	connectedCallback() {
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

		this.#observer?.observe(this.#loader);

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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const messageInput = document.querySelector<HTMLTextAreaElement>('#message-input')!;
const messageCountProgress = document.querySelector<HTMLProgressElement>('#word-count')!;
const messageCountText = document.querySelector<HTMLSpanElement>('#word-count-text')!;
/* eslint-enable @typescript-eslint/no-non-null-assertion */

function updateCharCount() {
	messageCountProgress.value = messageInput.value.length;
	messageCountProgress.textContent = messageInput.value.length === 0 ? '—' : messageInput.value.length.toString();
	messageCountText.textContent = messageCountProgress.textContent;
}

messageInput.addEventListener('input', updateCharCount);
messageInput.addEventListener('change', updateCharCount);
