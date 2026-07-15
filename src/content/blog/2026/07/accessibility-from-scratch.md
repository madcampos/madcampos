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
---

The title is a tongue-in-cheek parody of a [quote from Carl Sagan](https://www.youtube.com/watch?v=s4VIc8Qt5xM).
And it is quite fitting to explain the most repeated things about accessibility, specifically ARIA (Accessible Rich Internet Applications).

When we start learning about web accessibility the first thing we hear is usually:

> The first rule of ARIA is to not use ARIA.

Or, put another way:

> If there is a native element, use that instead of recreating the element.

I'm going to try to explain _why_ that is with the concrete example of a `button`.

## The reasoning behind it all

When we say to use native elements it is mostly because for each element/component there is a set of expectations on their behaviour.
Users on your application "perceive"[^1] the element and they expect to interact with the element in specific ways and that the element will work as expected.

We will start with the button role and element, from some references:

- [Button role on MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/button_role)
- [Button pattern on APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/examples/button/)
- [Button role on ARIA specification](https://w3c.github.io/aria/#button)
- [Button element on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)

Those references give us a set of things our button has to have or do:

1. Have a role of `button`.
2. Have an accessible label.
3. Be focusable.
4. Activate with a mouse click.
5. Activate by touch.
6. Activate by stylus and other pointing devices.
7. Activate on <kbd>Space</kbd> and <kbd>Enter</kbd> keys when focused.
8. Have a type and: submit a form; reset a form; or not do anything with the form.
9. A `name` and `value`, and form attributes when participating in forms.
10. Support global attributes like `autofocus`.
11. Support newer APIs like [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API), or [Interest Invokers API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers).

If that didn't scare you already of trying to re-implement a button from scratch, buckle up, because we will do it and I hope _that_ will discourage you.

## The foundation

First thing is to create a new tag, we do so because [custom tags](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) have no implicit role associated with them. We then add a `role` of `button` to it. Now it will be exposed to the accessibility tree as a button.

<m-note data-type="info">
	<rendered-content>
		<p><strong>NOTE</strong>: I will skip styling for this post for two reasons:</p>
		<ol>
			<li>It will make things unnecessarily longer.</li>
			<li>Custom elements can be styled however you like, so you can CSS the heck out of this "button".</li>
		</ol>
	</rendered-content>
</m-note>

```html
<sagan-button role="button">A button from scratch</sagan-button>
```

So far so good...

## Naming things

Our button should also have an accessible label, that can be either provided by the developer or as a last case fallback derived from the element's content. The problem here are specifically icon buttons.

If we update our markup to this:

```html
<sagan-button role="button">💩</sagan-button>
```

It will be read by a screen reader as:

> Button, pile of poo

There are a few issues here:

- Emojis are read out loud, with their [full legal name](https://www.unicode.org/emoji/charts-16.0/full-emoji-list.html).
- Not all browsers/operating systems support all emojis.
- This gives no clue to the user what that button does.

To remediate this we could add a label to the button, and mark the emoji as presentational or hide it, so it is ignored.

```html
<sagan-button role="button" aria-label="Data Sharing Options">
	<span role="presentation" aria-hidden="true">💩</span>
</sagan-button>
```

## Focus

To make the element focusable with the keyboard we need to add the `tabindex` attribute.
This will make so the element will become part of the tab order of the page, meaning when a user press <kbd>Tab</kbd> they will be able to reach the element.

```html
<sagan-button
	role="button"
	aria-label="Data Sharing Options"
	tabindex="0"
>
	<span role="presentation" aria-hidden="true">💩</span>
</sagan-button>
```

The value for the attribute here is `0` so the element will follow the existing order of the page, any positive value would make it jump in front of other elements and the focus of the page move all over, so it is **not recommended**.

## Interactions

Click, touch, and pointer interactions are ways to interact with an element with these modalities:

- _Click_ is for _mouse_, by using the mouse buttons, left, right, middle, and any other available button your neat gamer mouse may have.
- _Touch_ is for _touch screens_. It usually means a single tap, but we also have information on all the touch points on the device.
- _Pointer_ is the _generic version_ of the previous ones. It supports things used to "point" at the screen, including styluses.

<m-note data-type="info">
	<rendered-content>
		<p><strong>NOTE</strong>: For maintaining compatibility, browsers do map both touch and pointer events to some extent to <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event"><code>click</code></a> events.</p>
		<p>Keyboard events <em>may</em> also be mapped by default, but we will get back to that on the keyboard part of the article...</p>
	</rendered-content>
</m-note>

So we have to add the events. Starting with click:

```html
<sagan-button
	role="button"
	aria-label="Data Sharing Options"
	tabindex="0"
	onclick="console.log('click')"
>
	<span role="presentation" aria-hidden="true">💩</span>
</sagan-button>
```

For completeness sake, let's also add two more events:

- `ontouchend` for handling when the user lifts their finger from the element. There is no equivalent of the `click` event for touch, so this is the closest we get.[^2]
- `onpointerup` for handling other pointer devices, like styluses. Again, there is no equivalent of the `click` event here, so this is the closest we get.

Now our component looks like this:

```html
<sagan-button
	role="button"
	aria-label="Data Sharing Options"
	tabindex="0"
	onclick="console.log('click')"
	ontouchend="console.log('touch')"
	onpointerup="console.log('pointer')"
>
	<span role="presentation" aria-hidden="true">💩</span>
</sagan-button>
```

## And then JS was formed...

The code for the custom element is getting a little bit verbose on the HTML side of things. So let's give this a little bit more powers by [registering the component](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) and attaching a [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM).

To make event handling easier, it is done using the `handleEvent` method of our component. [This article explains about this event handling pattern](https://gomakethings.com/articles/the-handleevent-method-is-the-absolute-best-way-to-handle-events-in-web-components/).

This is done like so in typescript:

```typescript
class SaganButton extends HTMLElement {
	// A reference to the element internals,
	// this allows us to do some thigns with the element we cannot do otherwise.
	#internals: ElementInternals;

	// Typescript is a little bit annoying if we don't add this...
	declare shadowRoot: ShadowRoot;

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this.#internals = this.attachInternals();

		// Add back the things we had before.
		this.#internals.role = 'button';
		this.#internals.ariaLabel = 'Data Sharing Options';
		this.tabindex = 0;
	}

	handleEvent(evt: Event) {
		// We here filter by event type
		switch (evt.type) {
			// For all of those we want to do some action.
			// So here we use a fallthrough here.
			case 'click':
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
		this.addEventListener('click', this);
		this.addEventListener('touchend', this);
		this.addEventListener('pointerup', this);
	}

	disconnectedCallback() {
		// And remove the listeners
		// when the element is removed from the DOM.
		this.removeEventListener('click', this);
		this.removeEventListener('touchend', this);
		this.removeEventListener('pointerup', this);
	}

	#doButtonAction(evt: Event) {
		// TODO: Implement the actual button action.
	}
}
```

Okay, we are back to where we were, but now with more complexity! 🎉

## Keyboard interaction

The button can be activated with different pointers and touches and clicks, but not with keyboard. To do so, we need to add a `keypress` event listener so it can be interacted with.

Please note this is the bare minimum for a semi-working keyboard accessible button.
There are more nuance on the events and expectations. [Adrian Roselli covers this topic in more details](https://adrianroselli.com/2022/04/brief-note-on-buttons-enter-and-space.html).

<m-note data-type="info">
	<rendered-content>
		<p><strong>NOTE</strong>: from now on, I will skip some parts of the class code to keep it shorter and only highlight the added parts for brevity. </p>
		<p>The final complete code will be available at the end.</p>
	</rendered-content>
</m-note>

```typescript
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

	handleEvent(evt: Event) {
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

	#handleSpaceActivation(evt: KeyboardEvent) {
		// Don't do anything if the space bar is not pressed.
		if (evt.key !== ' ') {
			return;
		}

		if (document.activeElement !== this) {
			return;
		}

		this.#doButtonAction(evt);
	}

	#handleEnterActivation(evt: KeyboardEvent) {
		if (evt.key !== 'Enter') {
			return;
		}

		this.#doButtonAction(evt);
	}
}
```

## Disabled state

Now we are getting into attribute territory, this means implementing behaviors to match the native `<button>` element.

From MDN's docs on the `<button>` element, we have the `disabled` attribute. Let's use that as a starting point for the pattern to handle attributes we will use.

The attribute pattern is as follows:

1. Add the attribute to the `observedAttributes` array.
2. Create a getter and setter pair for the corresponding property.
3. On the setter, reflect the (normalized) new value on the attribute.
4. On the getter, return the attribute value (normalized).
5. On attribute changes, update the properties.

This allows for both attributes and properties to be kept in sync, as well as validating and transforming the value as needed, and falling back to default values.
It is the beginning of a reactive system, and can be used as the basis to implement dynamic updates to the DOM.

But I digress...

For the `disabled` attribute, we first need to set the `ariaDisabled` property of the `elementInternals`. Then add a new state to the element so it can be styled by CSS.

```typescript
class SaganButton extends HTMLElement {
	// Specify the attributes to observe.
	static observedAttributes = [
		'disabled'
	];

	// Add a setter...
	set disabled(newValue: boolean) {
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
	get disabled(): boolean {
		return this.hasAttribute('disabled');
	}

	// Watch for changes on the attribute.
	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
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

## Form association and button type

Buttons started as part of forms, so there are a lot of attributes related to... you guested, forms!

Again from MDN docs on the `<button>` element, here are the attributes related to forms:

- `type`: The button type, it can be one of 3 options (`submit`, `reset`, `button`). The options trigger the associated form submission, form reset, or don't do anything.
- `form`: the associated form, this is useful for the case where the button is not in the sub tree of the form element.
- `formaction`: a URL to submit the form to, this is so you can have different buttons submitting the form to different URLs.
- `formmethod`: Same as the above, different buttons can send different methods. HTML baby!
- `formenctype`: This also allows for different ways of sending the form data over the wire[^3].
- `formnovalidate`: Says the form should skip validation when this button is used.
- `formtarget`: If the form should open a new tab on submission or not.
- `name` and `value`: if present those are added to the form on submission.

Aside from the attributes, there are also some properties related to the [Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation):

- `validity`: The validity state of the button, it only makes sense for inputs, for buttons it will usually be the same.
- `validationMessage`: The error message to show to the user if there is an error for this button.
- `willValidate`: If this button will be a part of the constraint validation for the form or not.
- `checkValidity`/`reportValidty`: Methods to validate the element.
- `setCustomValidity`: Sets a custom error message to this element.

Ah, yes, we also need to add the `formAssociated` static property to the element to make it interact with forms.

Well... Let's get to writing all that...

```typescript
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

	set type(newValue: string | null) {
		// The default for button types is "submit",
		// So we validate and default to it if the value does not match.
		if (newValue && ['submit', 'reset', 'button'].includes(newValue?.toLowerCase())) {
			this.setAttribute('type', newValue);
		} else {
			this.setAttribute('type', 'submit');
		}
	}

	get type(): string {
		return this.getAttribute('type') ?? 'submit';
	}

	set form(newValue: string | null) {
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

	get form(): HTMLFormElement | null {
		// Here we get the value from the attribute as the first option.
		const formId = this.getAttribute('form');
		if (formId) {
			return document.getElementById(formId);
		}

		// Then fallback to whatever the browser has set.
		return this.#internals.form;
	}

	set formAction(newValue: string | null) {
		if (newValue === null) {
			this.removeAttribute('formaction');
			return;
		}

		this.setAttribute('formaction', newValue);
	}

	get formAction(): string | null {
		return this.getAttribute('formaction');
	}

	set formMethod(newValue: string | null) {
		// The default method is "get"
		if (newValue && ['post', 'get', 'dialog'].includes(newValue.toLowerCase())) {
			this.setAttribute('formmethod', newValue);
		} else {
			this.setAttribute('formmethod', 'get');
		}
	}

	get formMethod(): string {
		return this.getAttribute('formmethod') ?? 'get';
	}

	set formEnctype(newValue: string | null) {
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

	get formEnctype(): string {
		return this.getAttribute('formenctype') ?? 'application/x-www-form-urlencoded';
	}

	set formNoValidate(newValue: boolean) {
		this.toggleAttribute('formnovalidate', newValue);
	}

	get formNoValidate(): boolean {
		return this.hasAttribute('formnovalidate');
	}

	set formTarget(newValue: string | null) {
		// The default value is "_self".
		if (newValue && ['_self', '_blank', '_parent', '_top'].includes(newValue.toLowerCase())) {
			this.setAttribute('formtarget', newValue);
		} else {
			this.setAttribute('formtarget', '_self');
		}
	}

	get formTarget(): string {
		return this.getAttribute('formtarget') ?? '_self';
	}

	set name(newValue: string | null) {
		if (newValue === null) {
			this.removeAttribute('name');
			return;
		}

		this.setAttribute('name');
	}

	get name(): string | null {
		return this.getAttribute('name');
	}

	set value(newValue: string | null) {
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

	get value(): string | null {
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

	setCustomValidity(message: string) {
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

## Button action

Okay, after a wall of text, we get to the action. What we actually _do_ once the button is pressed. We defined a `#doButtonAction` method but didn't implement it.

Now is the time to implement the logic for the button action:

```typescript
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

## Recreating event listeners

There is one point that is not completely resolved yet: event listeners.
There are a couple of things that happen when the button is activated that are not covered:

- The button should change to the `active` state.
- If any listener calls `preventDefault` the default action should not run.

If we simply register event listeners to the button, as we have so far with `addEventListener` it would make our default event listener susceptible to all those things, and not able to toggle the `active` state on the button.

So we need to wrap the `addEventListener`, as well as all the [`on*` attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes#list_of_global_event_handler_attributes). Here is the code for wrapping the `addEventListener` method:

```typescript
class SaganButton extends HTMLElement {
	#originalAddEventListener: Element['addEventListener'];

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

	#wrappedAddEventListener<K extends keyof ElementEventMap>(type: K, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
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

	#doButtonAction(evt: Event) {
		// After the disabled check...

		this.#internals.states.delete('--active');

		if (evt.defaultPrevented) {
			return;
		}
		// ...
	}
}
```

## ARIA states and newer APIs

There are other ARIA states that affect buttons. As those already require JavaScript code to be written to handle those even for native buttons[^4].

There are also APIs like the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), or [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API), or even the experimental [Interest Invoker API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers). Those APIs bring more features to HTML in a way that is easy for developers to use and sets all the required logic for you by the browser.

I will skip those because they require extra code or relate to other elements _around_ the button.

Also this post is already almost 4000 words, so yeah...

## In closing

<strong style="font-size: var(--font-size-7);">USE THE DAMN HTML!</strong>

That's is. Don't reinvent the wheel if you don't need to.
It is too much work, and a lot of extra burden for you to maintain.

### But what if I only need a subset of features?

No you **don't**, it is way easier to use the existing elements and style them than it is to try and recreate the existing functionality that you need. Plus recreating things is brittle and error prone.

### But what if the element doesn't allow me to use my pretty brand colours?

First off, most html elements are very much easy to style nowadays. Have you heard about [custom selects](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select)?

Second, the elements that are harder to style still provide good usability, and degrading the user experience to have a pretty picker is not justifiable.

Lastly, inaccessible pages are liable to legal actions. Better keep those lawyers happy and the fines away, am I right?

### But what if the elements don't play well with react and tailwind?

Well... those are poor tech choices... React doesn't play well with anything to be honest.

But, there is still hope, with a little bit of persuasion so react doesn't throw away the DOM every time, it is very much doable.

As for tailwind, you can just write CSS and apply it, or use whatever escape hatch incantation tailwind uses to do very specific things.

### But my agent generates horrible inaccessible code...

Unfortunately LLMs generate inaccessible code by default, but not all is lost, [this article proposes solutions to the problem](https://master.dev/blog/ai-generated-ui-is-inaccessible-by-default/).

## The final code

```typescript
class SaganButton extends HTMLElement {
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

	#internals: ElementInternals;

	#originalAddEventListener: Element['addEventListener'];

	declare shadowRoot: ShadowRoot;

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

		// Wrap the original method.
		this.addEventListener = this.#wrappedAddEventListener;
	}

	set disabled(newValue: boolean) {
		this.toggleAttribute('disabled', newValue);

		this.#internals.ariaDisabled = newValue ? 'true' : 'false';

		if (newValue) {
			this.#internals.states.add('--disabled');
		} else {
			this.#internals.states.delete('--disabled');
		}
	}

	get disabled(): boolean {
		return this.hasAttribute('disabled');
	}

	set type(newValue: string | null) {
		if (newValue && ['submit', 'reset', 'button'].includes(newValue.toLowerCase())) {
			this.setAttribute('type', newValue);
		} else {
			this.setAttribute('type', 'submit');
		}
	}

	get type(): string {
		return this.getAttribute('type') ?? 'submit';
	}

	set form(newValue: string | null) {
		if (newValue === null) {
			this.removeAttribute('form');
			return;
		}

		const form = document.getElementById(newValue);
		if (form) {
			this.setAttribute('form', newValue);
		}
	}

	get form(): HTMLFormElement | null {
		const formId = this.getAttribute('form');
		if (formId) {
			return document.getElementById(formId) as HTMLFormElement | null;
		}

		return this.#internals.form;
	}

	set formAction(newValue: string | null) {
		if (newValue === null) {
			this.removeAttribute('formaction');
			return;
		}

		this.setAttribute('formaction', newValue);
	}

	get formAction(): string | null {
		return this.getAttribute('formaction');
	}

	set formMethod(newValue: string | null) {
		if (newValue && ['post', 'get', 'dialog'].includes(newValue.toLowerCase())) {
			this.setAttribute('formmethod', newValue);
		} else {
			this.setAttribute('formmethod', 'get');
		}
	}

	get formMethod(): string {
		return this.getAttribute('formmethod') ?? 'get';
	}

	set formEnctype(newValue: string | null) {
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

	get formEnctype(): string {
		return this.getAttribute('formenctype') ?? 'application/x-www-form-urlencoded';
	}

	set formNoValidate(newValue: boolean) {
		this.toggleAttribute('formnovalidate', newValue);
	}

	get formNoValidate(): boolean {
		return this.hasAttribute('formnovalidate');
	}

	set formTarget(newValue: string | null) {
		if (newValue && ['_self', '_blank', '_parent', '_top'].includes(newValue.toLowerCase())) {
			this.setAttribute('formtarget', newValue);
		} else {
			this.setAttribute('formtarget', '_self');
		}
	}

	get formTarget(): string {
		return this.getAttribute('formtarget') ?? '_self';
	}

	set name(newValue: string | null) {
		if (newValue === null) {
			this.removeAttribute('name');
			return;
		}

		this.setAttribute('name', newValue);
	}

	get name(): string | null {
		return this.getAttribute('name');
	}

	set value(newValue: string | null) {
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

	get value(): string | null {
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

	#wrappedAddEventListener<K extends keyof ElementEventMap>(type: K, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
		const defaultEvents = ['click', 'pointerup', 'touchend', 'keyup', 'keydown'];

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

	#doButtonAction(evt: Event) {
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

	#handleSpaceActivation(evt: KeyboardEvent) {
		if (evt.key !== ' ') {
			return;
		}

		if (document.activeElement !== this) {
			return;
		}

		this.#doButtonAction(evt);
	}

	#handleEnterActivation(evt: KeyboardEvent) {
		if (evt.key !== 'Enter') {
			return;
		}

		this.#doButtonAction(evt);
	}

	checkValidity() {
		return this.#internals.checkValidity();
	}

	reportValidity() {
		return this.#internals.reportValidity();
	}

	setCustomValidity(message: string) {
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

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
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
		}
	}

	handleEvent(evt: Event) {
		switch (evt.type) {
			case 'click':
			case 'touchend':
			case 'pointerup':
				this.#doButtonAction(evt);
				break;
			case 'keyup':
				this.#handleSpaceActivation(evt as KeyboardEvent);
				break;
			case 'keydown':
				this.#handleEnterActivation(evt as KeyboardEvent);
				break;
		}
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<slot></slot>
		`;

		this.addEventListener('click', this);
		this.addEventListener('touchend', this);
		this.addEventListener('pointerup', this);
		this.addEventListener('keyup', this);
		this.removeEventListener('keydown', this);
	}

	disconnectedCallback() {
		this.removeEventListener('click', this);
		this.removeEventListener('touchend', this);
		this.removeEventListener('pointerup', this);
		this.removeEventListener('keyup', this);
		this.removeEventListener('keydown', this);
	}
}
```

[^1]: In this case "perceive" is working both as visibly seeing the thing on the screen but also, hearing the element being announced, or getting it represented in the accessibility tree somehow that represents what is expected from that element.

[^2]: For mouse events there are also the `mousedown` and `mouseup` events for mouse. The big difference is it provides the `click` event for when the clicking action finishes, and the developer does not need to handle the lower level events.

[^3]: In modern development, where everything is sent to the server as JSON, this is a forgotten piece of how basic HTML can do _a lot_!

[^4]: There are _some_ exceptions, but those are more complex patterns or covered by other element combinations.
