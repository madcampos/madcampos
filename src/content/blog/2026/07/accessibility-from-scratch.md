---
title: If you want to create a `button` from scratch, you must first create the universe
summary: A concrete example of _why_ using native HTML as much as possible is better than slapping ARIA on top of things.
createdAt: 2026-07-15T00:22:16.552-04:00
tags:
  - a11y
  - Accessibility
  - Coding
  - Frontend
  - HTML
image: ./assets/apple-pie.jpg
imageAlt: 'A still from the "Cosmos" TV series, with Carl Sagan seated at a table with an apple pie in front of him. Overlayed on the apple pie is a button reading: "W3C WAI-AAA WCAG 2.2".'
updatedAt: 2026-07-20T14:40:00.000-04:00
updates:
  - date: 2026-07-20T14:40:00.000-04:00
    changes: Updated the part about emojis and icon buttons.
---

The title is a tongue-in-cheek parody of a [quote from Carl Sagan](https://www.youtube.com/watch?v=s4VIc8Qt5xM).
And it ties in very well with the thought exercise we are doing today.

When we start learning about web accessibility the first thing we hear one of two things:

> The first rule of ARIA is to not use ARIA.

And:

> If there is a native element, use that instead of recreating the element.

But people never explain _why_ this advice is given, and _why_ we should not recreate things from scratch.

I'm going to try to explain why recreating some components from scratch is usually a [Sisyphean task](https://www.merriam-webster.com/dictionary/Sisyphean) with the example of (mostly) recreating a `button` from scratch.

## Newtonian laws of UX

Native elements have a set of expectations on their behaviour. They _follow some laws of UX_. (See what I did there? lol)

Users on your application expect to interact with the element in specific ways and expect that the element will behave in specific ways.

For references, we will use the following links as a base of what a button _is_, how it _behave_, and how users expect to _interact_ with it.

- [Button role on MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/button_role)
- [Button pattern on APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/examples/button/)
- [Button role on ARIA specification](https://w3c.github.io/aria/#button)
- [Button element on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)

Those references give us the following list or requirements.
Along with the items are the WCAG Success Criteria (SC) that represent that requirement.

1. Have a role of `button`. ([SC 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
2. Have an accessible label. ([SC 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), and [SC 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
3. Be focusable. ([SC 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), and [SC 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))
4. Activate with a mouse click.
5. Activate by touch.
6. Activate by stylus and other pointing devices.
7. Activate on <kbd>Space</kbd> and <kbd>Enter</kbd> keys when focused. ([SC 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html))
8. Have a type and: submit a form; reset a form; or not do anything with the related form.
9. A `name` and `value`, and form attributes when participating in forms. ([SC 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
10. Participate in form validation. ([SC 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html))
11. Support states, like `disabled`. ([SC 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
12. Support newer APIs like [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API), or [Interest Invokers API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers).

If that didn't scare you already of trying to re-implement a button from scratch, buckle up, because we will work through that list and I hope _that_ will discourage you from recreating elements.

## Custom element nuclei

Our _custom element nucleus_ will be a new tag. We do so because [custom tags](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) behave just like a `<span>` by default. That gives us an "empty state" to start working on.

We then add a `role` of `button` to it. Now it will be exposed to the accessibility tree as a button.

<m-note data-type="info">
	<rendered-content>
		<p><strong>NOTE</strong>: styling the element will be left as an exercise to the reader for two reasons:</p>
		<ol>
			<li>It will make things unnecessarily longer for this blog post.</li>
			<li>Custom elements can be styled however you like, with no general restrictions.</li>
		</ol>
	</rendered-content>
</m-note>

```html /role="button"/
<sagan-button role="button">A button from scratch</sagan-button>
```

So far so good...

## Periodic table of ARIA

Our button should also have an accessible label, that can be either provided by the developer or as a last case fallback derived from the element's content.

The problem here is specifically icon buttons. If we update our markup to something like this:

```html
<sagan-button role="button">💩</sagan-button>
```

It will be read by a screen reader as something like[^1]:

> Button, pile of poo

The biggest thing here is that using _only emojis_ as the content of an element is a _**very bad pattern**_ in general. Here is a list of some of the issues with doing this:

- Emojis are read out loud, by their [full legal name](https://www.unicode.org/emoji/charts-16.0/full-emoji-list.html). That may not be descriptive of their meaning on that context.
- Not all browsers/operating systems support all emojis, and it may display as a [replacement character](https://en.wikipedia.org/wiki/Specials_(Unicode_block)#Replacement_character). On that case the browser may not even know the emoji's name or may convey incorrect information to the user, causing even more confusion.
- This pattern gives no clue to the user what that button _does in the context it is in_. What does a specific icon mean in that context?
- It starts failing WCAG [SC 2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html) and [SC 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value).

All those problems also apply for icon fonts, with the added problems that:

- Some icon fonts use [private use areas of Unicode](https://en.wikipedia.org/wiki/Private_Use_Areas). Characters on those areas have no inherent name, so it compounds even further on the naming problems.
- If the font doesn't load, your icons will break.
- If the font takes longer to load, it may cause layout shifts or a fallback to kick in.

The best alternative is to use SVG icons. Here are a few resources on SVG icons:

- https://kittygiraudel.com/2020/12/10/accessible-icon-links/
- https://www.sarasoueidan.com/blog/accessible-icon-buttons/
- https://css-tricks.com/accessible-svgs/#icons

For this exercise, we will remediate the emoji icon problem by:

1. Adding a label to the button
2. Changing the emoji to an inline SVG (icon code omitted for brevity).
3. Hiding the inline SVG.

That way the SVG will not get announced by screen readers, but the button still have a label.

The code will look as follows:

```html /aria-label/ /aria-hidden/
<sagan-button role="button" aria-label="Data Sharing Options">
	<svg aria-hidden="true">
		<!-- ... -->
	</svg>
</sagan-button>
```

## The focusable universe

The component now _looks like_ a button, is _announced_ like a button, but cannot be _interacted with_ yet.

The first part is to make the element keyboard focusable, to do so, we need to add the `tabindex` attribute.
This will make the element become part of the [tab order of the page](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex), meaning when a user press <kbd>Tab</kbd> they will be able to navigate and reach the element.

```html {4}
<sagan-button
	role="button"
	aria-label="Data Sharing Options"
	tabindex="0"
>
	<svg aria-hidden="true">
		<!-- ... -->
	</svg>
</sagan-button>
```

The value for the attribute here is `0` so the element will follow the existing order of the page, any positive value would make it jump in front of other elements and the focus of the page move all over, so [it is **not recommended**](https://adrianroselli.com/2014/11/dont-use-tabindex-greater-than-0.html).

## Fundamental element interactions

We then need to add some way to activate the component. Click, touch, and pointer interactions are ways to interact with the element using those modalities.

They cover, click for mouse buttons, touch for touch screens, and pointer for everything else like stylus.

<m-note data-type="info">
	<rendered-content>
		<p><strong>NOTE</strong>: For maintaining compatibility, browsers do map both touch and pointer events (to some extent) to <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event"><code>click</code></a> events but here we are implementing all of them independently for the sake of argument.</p>
		<p>Some keyboard events <em>may</em> also be mapped by default, but it gets more complicated than that...</p>
	</rendered-content>
</m-note>

We then add the events. Starting with the `mouseup` for handling mouse events:

```html {5}
<sagan-button
	role="button"
	aria-label="Data Sharing Options"
	tabindex="0"
	onomouseup="console.log('mouse')"
>
	<svg aria-hidden="true">
		<!-- ... -->
	</svg>
</sagan-button>
```

Let's also add two more events:

- `ontouchend` for handling when the user lifts their finger from the element.
- `onpointerup` for handling other pointer devices, like styluses.

Now our component looks like this:

```html {6-7}
<sagan-button
	role="button"
	aria-label="Data Sharing Options"
	tabindex="0"
	onmouseup="console.log('mouse')"
	ontouchend="console.log('touch')"
	onpointerup="console.log('pointer')"
>
	<svg aria-hidden="true">
		<!-- ... -->
	</svg>
</sagan-button>
```

## JS galaxy formation

The code for the custom element is getting a little bit verbose on the HTML side of things.
We will give it a little bit more powers by using JavaScript, [registering the component](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define), and [attaching a Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM).

<m-note data-type="info">
	<rendered-content>
		<p><strong>NOTE</strong>: To make event handling easier, it is done using the <code>handleEvent</code> method of our component.</p>
		<p><a href="https://gomakethings.com/articles/the-handleevent-method-is-the-absolute-best-way-to-handle-events-in-web-components/">This article explains the event handling pattern in detail</a>.</p>
	</rendered-content>
</m-note>

The code for the element looks like this:

```javascript
class SaganButton extends HTMLElement {
	// A reference to the element internals,
	// this allows us to do some thigns with the element we cannot do otherwise.
	/** @type {ElementInternals} */
	#internals;

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this.#internals = this.attachInternals();

		// Add back the things we had before.
		this.#internals.role = 'button';
		this.#internals.ariaLabel = 'Data Sharing Options';
		this.tabindex = 0;
	}

	/**
	 * @param {Event} evt
	 */
	handleEvent(evt) {
		// We here filter by event type
		switch (evt.type) {
			// For all of those we want to do some action.
			// So here we use a fallthrough here.
			case 'mouseup':
			case 'touchend':
			case 'pointerup':
				this.#doButtonAction(evt);
				break;
		}
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<slot></slot>
		`;

		// We add the event listeners
		// when the element is added to the DOM.
		this.addEventListener('mouseup', this);
		this.addEventListener('touchend', this);
		this.addEventListener('pointerup', this);
	}

	disconnectedCallback() {
		// And remove the listeners
		// when the element is removed from the DOM.
		this.removeEventListener('mouseup', this);
		this.removeEventListener('touchend', this);
		this.removeEventListener('pointerup', this);
	}

	/**
	 * @param {Event} evt
	 */
	#doButtonAction(evt) {
		// TODO: Implement the actual button action.
	}
}
```

Okay, we are back to where we were before adding JS into the mix, but now with more complexity! 🎉

## Cosmic Keyboard Interaction (CKI)

The button can be activated with clicks, touches, and pointers, but not using the _keyboard_. We now need to add a `keyup` and `keydown` event listener so the component can be interacted with using the keyboard.

<m-note data-type="info">
	<rendered-content>
		<p><strong>NOTE</strong>: this is the bare minimum for a semi-working keyboard accessible button.</p>
		<p>There are more nuance on the events and expectations. <a href="https://adrianroselli.com/2022/04/brief-note-on-buttons-enter-and-space.html">Adrian Roselli covers this topic in more details</a>.</p>
	</rendered-content>
</m-note>

```javascript
class SaganButton extends HTMLElement {
	connectedCallback() {
		// ...

		this.addEventListener('keyup', this);
		this.removeEventListener('keydown', this);
	}

	disconnectedCallback() {
		// ...

		this.removeEventListener('keyup', this);
		this.removeEventListener('keydown', this);
	}

	/**
	 * @param {Event} evt
	 */
	handleEvent(evt) {
		switch (evt.type) {
			// ...

			case 'keyup':
				this.#handleSpaceActivation(evt);
				break;
			case 'keydown':
				this.#handleEnterActivation(evt);
				break;
		}
	}

	/**
	 * @param {KeyboardEvent} evt
	 */
	#handleSpaceActivation(evt) {
		// Don't do anything if the space bar is not pressed.
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
}
```

## Absolute zero: When elements become `disabled`

Now we are getting into attribute territory, this means implementing behaviors to match the native `<button>` element.

From the [MDN docs on the `<button>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button), one of the attributes is the `disabled` attribute. Let's use it as a starting point for the pattern to handle attributes we will use.

The attribute pattern is as follows:

1. Add the attribute to the `observedAttributes` array.
2. Create a getter and setter pair for the corresponding property.
3. On the setter, reflect the normalized new value on the attribute.
4. On the getter, return the normalized attribute value.
5. On attribute changes, update the properties.

The pattern allows for both attributes and properties to be kept in sync, as well as validating and normalizing value as needed, as well as falling back to default values when needed.

It is the beginning of a reactive system, and can be used as the basis to implement dynamic updates to the DOM. But I digress...

For the `disabled` attribute, we first need to set the `ariaDisabled` property of the `elementInternals`. Then add a new state to the element so it can be styled by CSS.

```javascript
class SaganButton extends HTMLElement {
	// Specify the attributes to observe.
	static observedAttributes = [
		'disabled'
	];

	// Add a setter...
	/**
	 * @param {boolean} newValue
	 */
	set disabled(newValue) {
		this.toggleAttribute('disabled', newValue);

		// Note: `aria-disabled` is a string of "true" or "false", not a boolean.
		this.#internals.ariaDisabled = newValue ? 'true' : 'false';

		if (newValue) {
			this.#internals.states.add('--disabled');
		} else {
			this.#internals.states.delete('--disabled');
		}
	}

	// Then a getter...
	get disabled() {
		return this.hasAttribute('disabled');
	}

	// Watch for changes on the attribute.
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
		}
	}

	// ...
}
```

To add styles to the `disabled` state the CSS is similar to the one below:

```css
sagan-button:state(--disabled) { /* Styles for disabled state */ }
```

## Element interactions

Buttons started out as elements related to forms, so there are a lot of attributes for interacting with, you guested, forms!

Again from MDN docs on the `<button>` element, here are the attributes related to forms:

- `type`: The button type, it can be one of 3 options (`submit`, `reset`, `button`). The options trigger the associated form submission, form reset, or don't do anything.
- `form`: the associated form, this is useful for the case where the button is not in the sub tree of the form element.
- `formaction`: a URL to submit the form to, this is so you can have different buttons submitting the form to different URLs.
- `formmethod`: Same as the above, different buttons can send different methods. HTML baby!
- `formenctype`: This also allows for different ways of sending the form data over the wire[^2].
- `formnovalidate`: Says the form should skip validation when this button is used.
- `formtarget`: If the form should open a new tab on submission or not.
- `name` and `value`: if present those are added to the form on submission.

Aside from the attributes, there are also some properties related to the [Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation):

- `validity`: The validity state of the button, it only makes sense for inputs, for buttons it will usually be the same.
- `validationMessage`: The error message to show to the user if there is an error for this button.
- `willValidate`: If this button will be a part of the constraint validation for the form or not.
- `checkValidity`/`reportValidty`: Methods to validate the element.
- `setCustomValidity`: Sets a custom error message to this element.

Ah, yes, we also need to set the `formAssociated` static property to the element so everything works, without it, we would have a lot of errors.

Well... Let's get to writing all that...

```javascript
class SaganButton extends HTMLElement {
	// To make it interact with forms...
	static formAssociated = true;

	static observedAttributes = [
		'type',
		'form',
		'formaction',
		'formmethod',
		'formenctype',
		'formnovalidate',
		'formtarget',
		'name',
		'value'
		// ...
	];

	/**
	 * @param {string | null} newValue
	 */
	set type(newValue) {
		// The default for button types is "submit",
		// So we validate and default to it if the value does not match.
		if (newValue && ['submit', 'reset', 'button'].includes(newValue?.toLowerCase())) {
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

		// Here we need to check if the form is a valid element.
		// If it is, we then set the attribute.
		const form = document.getElementById(newValue);
		if (form) {
			this.setAttribute('form', newValue);
		}
	}

	/**
	 * @returns {HTMLFormElement | null}
	 */
	get form() {
		// Here we get the value from the attribute as the first option.
		const formId = this.getAttribute('form');
		if (formId) {
			return document.getElementById(formId);
		}

		// Then fallback to whatever the browser has set.
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
		// The default method is "get"
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
		// The default value is "form url encoded".
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
		// The default value is "_self".
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

		this.setAttribute('name');
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

		// We need to set the button's value.
		this.#internals.setFormValue(newValue);
		// And the validation state.
		this.#internals.setValidity({});

		// And the valid/invalid states.
		this.#internals.states.add('--valid');
		this.#internals.states.delete('--invalid');
	}

	get value() {
		return this.getAttribute('value');
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
		// ...

		switch (name) {
			// ...

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
		}
	}
}
```

## For every action...

After a wall of text, we write the logic for what to actually _do_ once the button is activated. We defined a `#doButtonAction` method before but didn't implement it.

Now is the time to implement that method:

```javascript
class SaganButton extends HTMLElement {
	// ...

	#doButtonAction() {
		// First check if the button is disabled,
		// On that case nothing should happen.
		if (this.disabled) {
			return;
		}

		// Then check the button type.
		if (this.type === 'button') {
			return;
		}

		// Here we reset the form if the button is a reset one.
		if (this.type === 'reset') {
			this.form?.reset();
			return;
		}

		// Finally, if it is a submit button,
		// AND IF we wired everything correctly,
		// The form will be handled by the browser.
		this.form?.requestSubmit(this);
	}

	// ...
}
```

We _could_ also handle all the validations and form submission by ourselves, including the button and form validations. But this is already a painful and long enough post as it is.
So to avoid more self inflicted pain, in the end, we let the browser handle the form submission for us.

## Event listener horizon

There are a couple of things that happen when the button is activated that are not covered:

- The component should change to the `active` state.
- If any listener calls `preventDefault` the default action that we just implemented should not run.

If we simply register event listeners to the button, as we have so far with `addEventListener` it would make our default event listener not work, as it may run out of order with other event listeners added by the user using our component.

We want to run an event listener _before_ and another _after_ every other listener. To do so we need to wrap the `addEventListener`, as well as all the [`on*` attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes#list_of_global_event_handler_attributes) we care about.

Here is the code for wrapping the `addEventListener` method:

```javascript
class SaganButton extends HTMLElement {
	/** @type {Element['addEventListener']} */
	#originalAddEventListener;

	constructor() {
		// ...

		// Add event listeners for to set the active state.
		this.addEventListener('pointerdown', this.#setActiveState);
		this.addEventListener('touchstart', this.#setActiveState);
		this.addEventListener('mousedown', this.#setActiveState);
		this.addEventListener('keydown', this.#setActiveState);

		// Keep a reference to the original method.
		this.#originalAddEventListener = this.addEventListener;

		// Wrap the original method.
		this.addEventListener = this.#wrappedAddEventListener;
	}

	/**
	 * @template {keyof ElementEventMap} K
	 * @param {K} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {boolean | EventListenerOptions} [options]
	 */
	#wrappedAddEventListener(type, listener, options) {
		const defaultEvents = ['click', 'pointerup', 'touchend', 'keyup', 'keydown'];

		// If one of the default events,
		// Remove the default event listener, and re-add it as the last one.
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
		// After the disabled check...

		this.#internals.states.delete('--active');

		if (evt.defaultPrevented) {
			return;
		}
		// ...
	}
}
```

For the attribute event listeners, there are two caveats to note:

- The attributes accept a string.
- The property accepts a function.

For the property case, it would be as simple as calling the `#wrappedAddEventListener`.

The problem is with the attribute, as it can accept a number of things that should be [parsed as JavaScript code](https://html.spec.whatwg.org/multipage/webappapis.html#event-handler-content-attributes).

Here is one example for the `onmosueup` attribute and property:

```javascript
class SaganButton extends HTMLElement {
	static observedAttributes = [
		// ...
		'onmouseup'
	];

	// Keep a list of event listeners for attributes.
	/** @type {Record<string, EventListener>} */
	#attributeEventListeners = {};

	/**
	 * @param {EventListener | null} newValue
	 */
	set onmouseup(newValue) {
		if (!newValue) {
			// Check if there is already a saved listener.
			const savedListener = this.#attributeEventListeners['mouseup'];
			if (savedListener) {
				// Then remove it, and delete the reference.
				this.removeEventListener('mouseup', savedListener);
				delete this.#attributeEventListeners['mouseup'];
			}
		} else {
			// Add a new listener and save the reference.
			this.addEventListener('mouseup', newValue);
			this.#attributeEventListeners['mouseup'] = newValue;
		}
	}

	get onmouseup() {
		return this.#attributeEventListeners['mouseup'] ?? null;
	}

	/**
	 * @param {string} name
	 * @param {string | null} oldValue
	 * @param {string | null} newValue
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		// ...

		switch (name) {
			// ...
			case 'onmouseup':
				this.onmouseup = this.#parseAttributeListener(newValue);
				break;
		}
	}

	/**
	 * @param {string | null} value
	 */
	#parseAttributeListener(value) {
		// If no value is passed it returns null.
		if (!value) {
			return null;
		}

		try {
			// NOTE: This is very bad practice!
			// It creates an immediatly invoked function body out of the value given.
			// When it is called, it will execute whatever is passed as the value.
			return new Function('evt', `(${value})(evt);`);
		} catch (err) {
			// If there is an error with the function, returns null.
			console.error(err);
			return null;
		}
	}
}
```

## Unexplored API space

There are APIs like the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), or [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API), or even the experimental [Interest Invoker API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers). All those APIs bring more features to HTML in a way that is easy for developers to use and handles all the required logic by the browser.

I will skip those because they require extra code or relate to other elements _around_ the button like dialogs. Also this post is just north of 4000 words, so yeah...

## In closing

<strong style="font-size: var(--font-size-7);">USE SEMANTIC HTML!</strong>

That's is. Don't reinvent the wheel if you don't absolutely need to.
It is too much work, and a lot of extra burden for you to maintain.

The example code for this button component is almost 500 lines of JS (see it below), where a native HTML button is 0 lines of JS.
All that work to achieve only _some_ of the functionality! That is an insane amount of work for almost no return, so do yourself a favour and just use the semantic native options.

## Appendix A - Frequently Asked Questions (FAQ)

### Question: But what if I only need a subset of features?

Even if you use only part of the functionality, using semantic HTML is less code to maintain and makes your codebase easier to reason about.
On the plus side, if you ever need some other functionality, it is already there, provided by the platform, no extra code.

### Question: But what if the element doesn't allow me to use my brand colours?

Styling elements would have been a big issue on <span style="font-family: var(--font-old-style);">ye olde IE days</span>. Nowadays it is mostly okay.
This [MDN guide on styling forms](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Styling_web_forms#types_of_widgets) gives a good breakdown of what is easy and what is not. Even for the harder ones it requires more CSS massaging, but it is still technically feasible.
Also, have you heard about [custom selects](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select)?

Another point is that hand rolling a component is a lot of work and most of the time breaks user expectations, talk to the designer and ask the question: is this the best user experience or could we use another pattern?

Lastly, inaccessible pages are liable to legal actions. Better keep those lawyers happy and the fines away, am I right?

### Question: But what if the elements don't play well with \[insert framework of choice here]?

Well... Sometimes we can't choose the tools we use, but we still can make the best out of them. For the code you write, use more semantic HTML and test things out.

### Question: But my agent generates horrible inaccessible code, what should I do?

Unfortunately LLMs generate inaccessible code by default, but not all is lost, [this article proposes solutions to the problem](https://master.dev/blog/ai-generated-ui-is-inaccessible-by-default/).

## Appendix B - The final code

All the glorious almost 500 lines of it!

[Component code available here](/assets/documents/js/sagan-button.js)

[^1]: The exact reading by the screen reader is not the point here, the main problem is that emojis are read out loud by a name that is usually not intuitive.

[^2]: In modern development, where everything is sent to the server as JSON, this is a forgotten piece of how basic HTML can do _a lot_!

[^3]: There are _some_ exceptions, but those are more complex patterns or covered by other element combinations.
