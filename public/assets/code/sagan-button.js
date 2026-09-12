export class SaganButton extends HTMLElement {
	static formAssociated = true;
	static observedAttributes = [
		'disabled',
		'type',
		'form',
		'formaction',
		'formmethod',
		'formenctype',
		'formnovalidate',
		'formtarget',
		'name',
		'value'
	];

	/** @type {ElementInternals} */
	#internals;

	/** @type {Element['addEventListener']} */
	#originalAddEventListener;

	/** @type {Record<string, EventListener>} */
	#attributeEventListeners = {};

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this.#internals = this.attachInternals();

		this.#internals.role = 'button';
		this.#internals.ariaLabel = 'Data Sharing Options';
		this.tabIndex = 0;

		this.addEventListener('pointerdown', this.#setActiveState);
		this.addEventListener('touchstart', this.#setActiveState);
		this.addEventListener('mousedown', this.#setActiveState);
		this.addEventListener('keydown', this.#setActiveState);

		this.#originalAddEventListener = this.addEventListener;
		this.addEventListener = this.#wrappedAddEventListener;
	}

	/**
	 * @param {boolean} newValue
	 */
	set disabled(newValue) {
		this.toggleAttribute('disabled', newValue);

		this.#internals.ariaDisabled = newValue ? 'true' : 'false';

		if (newValue) {
			this.#internals.states.add('--disabled');
		} else {
			this.#internals.states.delete('--disabled');
		}
	}

	get disabled() {
		return this.hasAttribute('disabled');
	}

	/**
	 * @param {string | null} newValue
	 */
	set type(newValue) {
		if (newValue && ['submit', 'reset', 'button'].includes(newValue.toLowerCase())) {
			this.setAttribute('type', newValue);
		} else {
			this.setAttribute('type', 'submit');
		}
	}

	get type() {
		return this.getAttribute('type') ?? 'submit';
	}

	/**
	 * @param {string | null} newValue
	 */
	set form(newValue) {
		if (newValue === null) {
			this.removeAttribute('form');
			return;
		}

		const form = document.getElementById(newValue);
		if (form) {
			this.setAttribute('form', newValue);
		}
	}

	/**
	 * @returns {HTMLFormElement | null}
	 */
	get form() {
		const formId = this.getAttribute('form');
		if (formId) {
			return /** @type {HTMLFormElement | null} */ (document.getElementById(formId));
		}

		return this.#internals.form;
	}

	/**
	 * @param {string | null} newValue
	 */
	set formAction(newValue) {
		if (newValue === null) {
			this.removeAttribute('formaction');
			return;
		}

		this.setAttribute('formaction', newValue);
	}

	get formAction() {
		return this.getAttribute('formaction');
	}

	/**
	 * @param {string | null} newValue
	 */
	set formMethod(newValue) {
		if (newValue && ['post', 'get', 'dialog'].includes(newValue.toLowerCase())) {
			this.setAttribute('formmethod', newValue);
		} else {
			this.setAttribute('formmethod', 'get');
		}
	}

	get formMethod() {
		return this.getAttribute('formmethod') ?? 'get';
	}

	/**
	 * @param {string | null} newValue
	 */
	set formEnctype(newValue) {
		if (
			newValue &&
			[
				'application/x-www-form-urlencoded',
				'multipart/form-data',
				'text/plain'
			].includes(newValue.toLowerCase())
		) {
			this.setAttribute('formenctype', newValue);
		} else {
			this.setAttribute('formenctype', 'application/x-www-form-urlencoded');
		}
	}

	get formEnctype() {
		return this.getAttribute('formenctype') ?? 'application/x-www-form-urlencoded';
	}

	/**
	 * @param {boolean} newValue
	 */
	set formNoValidate(newValue) {
		this.toggleAttribute('formnovalidate', newValue);
	}

	get formNoValidate() {
		return this.hasAttribute('formnovalidate');
	}

	/**
	 * @param {string | null} newValue
	 */
	set formTarget(newValue) {
		if (newValue && ['_self', '_blank', '_parent', '_top'].includes(newValue.toLowerCase())) {
			this.setAttribute('formtarget', newValue);
		} else {
			this.setAttribute('formtarget', '_self');
		}
	}

	get formTarget() {
		return this.getAttribute('formtarget') ?? '_self';
	}

	/**
	 * @param {string | null} newValue
	 */
	set name(newValue) {
		if (newValue === null) {
			this.removeAttribute('name');
			return;
		}

		this.setAttribute('name', newValue);
	}

	get name() {
		return this.getAttribute('name');
	}

	/**
	 * @param {string | null} newValue
	 */
	set value(newValue) {
		if (newValue === null) {
			this.removeAttribute('value');
			return;
		}

		this.setAttribute('value', newValue);

		this.#internals.setFormValue(newValue);
		this.#internals.setValidity({});

		this.#internals.states.add('--valid');
		this.#internals.states.delete('--invalid');
	}

	get value() {
		return this.getAttribute('value');
	}

	/**
	 * @param {EventListener | null} newValue
	 */
	set onmouseup(newValue) {
		const savedListener = this.#attributeEventListeners.mouseup;

		if (!newValue) {
			if (savedListener) {
				this.removeEventListener('mouseup', savedListener);
				delete this.#attributeEventListeners.mouseup;
			}
		} else {
			this.addEventListener('mouseup', newValue);
			this.#attributeEventListeners.mouseup = newValue;
		}
	}

	get onmouseup() {
		return this.#attributeEventListeners.mouseup ?? null;
	}

	get willValidate() {
		if (this.type === 'button' || this.type === 'reset') {
			return false;
		}

		if (this.closest('datalist')) {
			return false;
		}

		if (this.disabled) {
			return false;
		}

		if (!this.#internals.validity.customError) {
			return false;
		}

		return this.#internals.willValidate;
	}

	get validationMessage() {
		return this.willValidate ? this.#internals.validationMessage : '';
	}

	get validity() {
		return this.#internals.validity;
	}

	/**
	 * @template {keyof ElementEventMap} K
	 * @param {K} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 */
	#wrappedAddEventListener(type, listener, options) {
		const defaultEvents = ['mouseup', 'pointerup', 'touchend', 'keyup', 'keydown'];

		if (defaultEvents.includes(type)) {
			this.removeEventListener(type, this);

			this.#originalAddEventListener.call(this, type, listener, options);
			this.addEventListener(type, this);
		} else {
			this.#originalAddEventListener.call(this, type, listener, options);
		}
	}

	#setActiveState() {
		if (this.disabled) {
			return;
		}

		this.#internals.states.add('--active');
	}

	/**
	 * @param {Event} evt
	 */
	#doButtonAction(evt) {
		if (this.disabled) {
			return;
		}

		this.#internals.states.delete('--active');

		if (evt.defaultPrevented) {
			return;
		}

		if (this.type === 'button') {
			return;
		}

		if (this.type === 'reset') {
			this.form?.reset();
			return;
		}

		this.form?.requestSubmit(this);
	}

	/**
	 * @param {KeyboardEvent} evt
	 */
	#handleSpaceActivation(evt) {
		if (evt.key !== ' ') {
			return;
		}

		if (document.activeElement !== this) {
			return;
		}

		this.#doButtonAction(evt);
	}

	/**
	 * @param {KeyboardEvent} evt
	 */
	#handleEnterActivation(evt) {
		if (evt.key !== 'Enter') {
			return;
		}

		this.#doButtonAction(evt);
	}

	/**
	 * @param {string | null} value
	 */
	#parseAttributeListener(value) {
		if (!value) {
			return null;
		}

		try {
			return new Function('evt', `(${value})(evt);`);
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	checkValidity() {
		return this.#internals.checkValidity();
	}

	reportValidity() {
		return this.#internals.reportValidity();
	}

	/**
	 * @param {string} message
	 */
	setCustomValidity(message) {
		if (message) {
			this.#internals.setValidity({ customError: true }, message);
			this.#internals.states.add('--invalid');
			this.#internals.states.delete('--valid');
		} else {
			this.#internals.setValidity({});
			this.#internals.states.add('--valid');
			this.#internals.states.delete('--invalid');
		}
	}

	/**
	 * @param {string} name
	 * @param {string | null} oldValue
	 * @param {string | null} newValue
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'disabled':
				this.disabled = newValue !== null;
				break;
			case 'type':
				this.type = newValue;
				break;
			case 'form':
				this.form = newValue;
				break;
			case 'formaction':
				this.formAction = newValue;
				break;
			case 'formmethod':
				this.formMethod = newValue;
				break;
			case 'formenctype':
				this.formEnctype = newValue;
				break;
			case 'formnovalidate':
				this.formNoValidate = newValue !== null;
				break;
			case 'formtarget':
				this.formTarget = newValue;
				break;
			case 'name':
				this.name = newValue;
				break;
			case 'value':
				this.value = newValue;
				break;
			case 'onmouseup':
				this.onmouseup = this.#parseAttributeListener(newValue);
				break;
			default:
		}
	}

	/**
	 * @param {Event} evt
	 */
	handleEvent(evt) {
		switch (evt.type) {
			case 'mouseup':
			case 'touchend':
			case 'pointerup':
				this.#doButtonAction(evt);
				break;
			case 'keyup':
				this.#handleSpaceActivation(/** @type {KeyboardEvent} */ (evt));
				break;
			case 'keydown':
				this.#handleEnterActivation(/** @type {KeyboardEvent} */ (evt));
				break;
			default:
		}
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<slot></slot>
		`;

		this.#originalAddEventListener('mouseup', this);
		this.#originalAddEventListener('touchend', this);
		this.#originalAddEventListener('pointerup', this);
		this.#originalAddEventListener('keyup', this);
		this.#originalAddEventListener('keydown', this);
	}

	disconnectedCallback() {
		this.removeEventListener('mouseup', this);
		this.removeEventListener('touchend', this);
		this.removeEventListener('pointerup', this);
		this.removeEventListener('keyup', this);
		this.removeEventListener('keydown', this);
	}
}

if (!customElements.get('sagan-button')) {
	customElements.define('sagan-button', SaganButton);
}
