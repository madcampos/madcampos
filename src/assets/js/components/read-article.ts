// TODO: implement article reading component
// Ref: https://blog.damato.design/_astro/hoisted.C11L7A5c.js
// 1. Get list of voices
// 2. Group list by language, local/online; sort by name; show default first. (hide other languages?)
// 3. Get article elements, split by element type like code or paragraphs
// 4. Infer element language
// 5. Set global pitch, speed, and volume
// 6. Add event to pause on voice change
// 7. Add event for boundaries and implement highlight of word when the boundary change

import { SiteSettings } from '../settings.ts';

// TODO: add global settings for reading code, reading image alt text, etc.

interface WordReference {
	element: HTMLElement;
	word: string;
	startIndex: number;
	endIndex: number;
}

class ReadArticle extends HTMLElement implements CustomElement {
	#utterance = new SpeechSynthesisUtterance('');
	#wordMap: WordReference[] = [];
	#isReading = false;
	#wordIndex = 0;

	constructor() {
		super();

		if (!('speechSynthesis' in window)) {
			return;
		}

		this.render();
	}

	#resetUtterance(text: string) {
		speechSynthesis.cancel();

		this.#utterance.removeEventListener('boundary', this);
		this.#utterance.removeEventListener('end', this);
		this.#utterance.removeEventListener('pause', this);
		this.#utterance.removeEventListener('resume', this);
		this.#utterance.removeEventListener('start', this);

		this.#utterance = new SpeechSynthesisUtterance('');
		this.#utterance.lang = document.documentElement.lang;
		this.#utterance.rate = SiteSettings.readingSpeed;

		// TODO: set voice

		this.#utterance.addEventListener('boundary', this);
		this.#utterance.addEventListener('end', this);
		this.#utterance.addEventListener('pause', this);
		this.#utterance.addEventListener('resume', this);
		this.#utterance.addEventListener('start', this);
	}

	#buildWordMap() {
		// TODO: gather all elements
		// TODO: remove elements disabled on settings
		// TODO: break text into words using segmenter api
		// TODO: iterate over the elements creating a list of word ranges.
	}

	#listVoices() {
		// TODO: get all voices
		// TODO: group voices by language
		// TODO: group languages by online/local
		// TODO: sort all groups
		// TODO: get default voice?
		// TODO: return formatted select?
	}

	#highlightWord() {
		if (!('highlighs' in CSS)) {
			return;
		}

		this.#wordIndex += 1;

		CSS.highlights.delete('reading-highlight');
		// TODO: add new highlight
	}

	#toggleReading() {
		if (this.#isReading) {
			speechSynthesis.pause();
			this.#isReading = false;
		} else if (this.#wordIndex === 0) {
			speechSynthesis.speak(this.#utterance);
			this.#isReading = true;
		} else {
			speechSynthesis.resume();
			this.#isReading = true;
		}
	}

	handleEvent(event: Event) {
		if (event instanceof SpeechSynthesisEvent) {
			switch (event.type) {
				case 'boundary':
					break;
				case 'end':
					break;
				case 'pause':
					break;
				case 'start':
				case 'resume':
					break;
				default:
			}
		}
	}

	render() {
		this.innerHTML = `
			<button type="button">Read article</button>
			<fieldset>
				<legend>Reading options</legend>

				<input-wrapper>
					<label for="">Voice</label>
					<select name="voice" id=""></select>
				</input-wrapper>

				<input-wrapper>
					<label for="">Speed</label>
					<input
						name="voice-speed"
						id=""
						type="number"
						min="0.5"
						step="0.1"
						max="3"
					/>
				</input-wrapper>
				<button type="button">Other options</button>
			</fieldset>
		`;

		// TODO: call list voices
	}

	connectedCallback() {
		if (!('speechSynthesis' in window)) {
		}

		// TODO: hook up event listeners
	}

	// TODO: add event handling, setup, and cleanup
}
