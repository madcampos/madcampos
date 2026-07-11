---
title: If you want to create a `button` from scratch, you must first create the universe
summary: A concrete example of _why_ using native HTML as much as possible is better than slapping ARIA on top of things.
createdAt: 2026-06-23T11:06:16.552-04:00
draft: true
tags:
  - a11y
  - Accessibility
  - Coding
  - Frontend
  - HTML
---

The title is a tongue-in-cheek parody of a [quote from Carl Sagan](https://www.youtube.com/watch?v=s4VIc8Qt5xM).
And it is quite fitting to explain why one of the most repeated things about accessibility, specially ARIA (Accessible Rich Internet Applications).

When we start learning about web accessibility the first two things we hear are usually:

> The first rule of ARIA is to not use ARIA.

Or:

> If there is a native element, use that instead of recreating the element.

I'm going to try to explain _why_ that is with the concrete example of a `button`.

## The reasoning behind it all

When we say to use native elements it is mostly because for each component there is a set of expectations on their behaviour. Users on your application "see"[^1] the element and they expect to interact with the element in specific ways and that the element will work as expected.

Here is an example of expectations for a button from the [ARIA Authoring Practice Guide's button example](https://www.w3.org/WAI/ARIA/apg/patterns/button/):

> ### Keyboard Interaction
>
> When the button has focus:
>
> - <kbd>Space</kbd>: Activates the button.
> - <kbd>Enter</kbd>: Activates the button.
> - Following button activation, focus is set depending on the type of action the button performs. For example:
>   - If activating the button opens a dialog, the focus moves inside the dialog. (see [dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/))
>   - If activating the button closes a dialog, focus typically returns to the button that opened the dialog unless the function performed in the dialog context logically leads to a different element. For example, activating a cancel button in a dialog returns focus to the button that opened the dialog. However, if the dialog were confirming the action of deleting the page from which it was opened, the focus would logically move to a new context.
>   - If activating the button does not dismiss the current context, then focus typically remains on the button after activation, e.g., an Apply or Recalculate button.
>   - If the button action indicates a context change, such as move to next step in a wizard or add another search criteria, then it is often appropriate to move focus to the starting point for that action.
>   - If the button is activated with a shortcut key, the focus usually remains in the context from which the shortcut key was activated. For example, if <kbd>Alt</kbd> + <kbd>U</kbd> were assigned to an "Up" button that moves the currently focused item in a list one position higher in the list, pressing <kbd>Alt</kbd> + <kbd>U</kbd> when the focus is in the list would not move the focus from the list.
>
> ### WAI-ARIA Roles, States, and Properties
>
> - The button has role of [button](https://w3c.github.io/aria/#button).
> - The `button` has an accessible label. By default, the accessible name is computed from any text content inside the button element. However, it can also be provided with [aria-labelledby](https://w3c.github.io/aria/#aria-labelledby) or [aria-label](https://w3c.github.io/aria/#aria-label).
> - If a description of the button's function is present, the button element has [aria-describedby](https://w3c.github.io/aria/#aria-describedby) set to the ID of the element containing the description.
> - When the action associated with a button is unavailable, the button has [aria-disabled](https://w3c.github.io/aria/#aria-disabled) set to `true`.
> - If the button is a toggle button, it has an [aria-pressed](https://w3c.github.io/aria/#aria-pressed) state. When the button is toggled on, the value of this state is `true`, and when toggled off, the state is `false`.

That is a lot... Not to mention that the button also need to be:

- Clickable, and work with the mouse.
- Touchable, and work with touch screens.
- Depending on it's type, it will submit a form, reset it, or not do anything to the form.
- A `name` and `value`, amongst other attributes to participate in forms.
- Some newer features like the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).

If that didn't scare you already of trying to re-implement a button from scratch, buckle up, because we will do it and I hope _that_ will discourage you.

## The foundation

First thing is to create a new tag, we do so because custom tags have no implicit role associated with them. So we add a `role` of `button` to it. Now it will be exposed to the accessibility tree as a button.

I will skip styling for this post for two reasons:

1. It will make things unnecessarily longer.
2. Custom elements can be styled however you like, so you can CSS the heck out of this "button".

```html
<sagan-button role="button">A button from scratch</sagan-button>
```

So far so good...

## Naming things

Our button should also have an accessible label, luckily from us, it is derived from the element contents. That solves one of the problems for us.

## Interactions

Click, touch, and pointer interactions are ways to interact with an element with those modalities:

- Click is for mouse, by using the mouse buttons, left, right, middle, and any other available button your neat gamer mouse may have.
- Touch is four touch screens, it usually means a single tap, but we also have information on all the touch points on the device.
- Pointer is a generic version of the previous ones, plus support for stylus and whatever other similar pointer device.

For maintaining compatibility, browsers do map both touch and pointer events to some extent to [`click`](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event) events[^2].
Keyboard events may also be mapped by default, but I will get back to that on the keyboard part of the article...

So we have to add the events. Starting with click:

```html
<sagan-button
	role="button"
	onclick="console.log(event)"
>
	A button from scratch
</sagan-button>
```

For completeness sake, let's also add two more events:

- `ontouchend` for handling when the user lifts their finger from the element. There is no equivalent of the `click` event for touch, do this is the closest we get.
- `onpointerup` for handling other pointer devices, like styluses. Again, there is no equivalent of the `click` event here, so this is the closest we get.

Now our component looks like this:

```html
<sagan-button
	role="button"
	onclick="console.log('click')"
	ontouchend="console.log('touch')"
	onpointerup="console.log('pointer')"
>
	A button from scratch
</sagan-button>
```

## After the Big Bang, came JS

This is getting a little bit verbose on the HTML side of things, so let's give this a little bit more powers by [registering the component](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) and attaching a [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM).

This is done like so in typescript:

```typescript
// Our component is a class, and it has to extend from `HTMLElement`.
// We could, in theory, implement everything from the `HTMLElement` class from scratch, but that would be another fool's errand.
// Let's keep it one at a time...
class SaganButton extends HTMLElement {
	// A reference to the element internals, we will assign it in the constructor.
	// It is also a private property (prfixed by a hashtag `#`).
	#internals: ElementInternals;

	constructor() {
		super();

		// We attach the shadow DOM to the element.
		// Using the `open` mode here makes the shadow root available on `this.shadowRoot`.
		this.attachShadow({ mode: 'open' });

		// Now we assign the internals of the element.
		// This gives us control over forms and ARIA.
		this.#internals = this.attachInternals();

		// Add back the `button` role.
		this.role = 'button';
	}

	// This method is called when the element is added to the DOM.
	connectedCallback() {
		// Here we define the element's internal HTML structure.
		// Without it, the element shows nothing.
		// This is just a simple slot holder, so it shows the DOM contents.
		this.shadowRoot.innerHTML = `
			<slot></slot>
		`;

		// Now we re-add the event handlers...
		// It using a pattern explained below.
		this.addEventListener('click', this);
		this.addEventListener('touchend', this);
		this.addEventListener('pointerup', this);
	}

	disconnectedCallback() {
		// We do some cleanup of the event listeners...
		this.removeEventListener('click', this);
		this.removeEventListener('touchend', this);
		this.removeEventListener('pointerup', this);
	}

	// This method allows us to centralize event handling.
	// It also makes easier to add and remove event handlers,
	// without having to keep references to the event handlers themselves.
	handleEvent(evt: Event) {
		// We here filter by event type
		switch (evt.type) {
			// For all of those we want to do some action.
			// So here we will call the method to do the action.
			case 'click':
			case 'touchend':
			case 'pointerup':
				this.#doButtonAction();
				break;
		}
	}

	#doButtonAction() {
		// Implementation to come after.
	}
}

// Lastly, we register the element, so it will be augmented and not a simple tag anymore.
customElements.define('sagan-button', SaganButton);
```

Okay, we are back to where we were, but now with more complexity! 🎉

## Keyboard interaction

The button is clickable, tappable, and pointable (?), but still not accessible via keyboard. To do so, we need to add a couple of things:

- Add a `tabindex`, so it can be reached when pressing <kbd>tab</kbd>.
- Add a `keypress` event listener so it can be interacted with.

Please note this is the bare minimum for a semi working keyboard accessible button. There are more nuance on the events and expectations. [Adrian Roselli covers this topic in more details](https://adrianroselli.com/2022/04/brief-note-on-buttons-enter-and-space.html).

**Note**: from now on, I will skip some parts of the class code to keep it shorter and only highlight the added parts for brevity. The final complete code will be available at the end.

```typescript
class SaganButton extends HTMLElement {
	constructor() {
		// ...

		// Add a tabindex of `0` so the element is added to the tab order of the page.
		this.tabindex = 0;
	}

	connectedCallback() {
		this.addEventListener('keyup', this);
		// ...
	}

	disconnectedCallback() {
		this.removeEventListener('keyup', this);
		// ...
	}

	handleEvent(evt: Event) {
		switch (evt.type) {
			// Add an event handler for the keyboard.
			// Here we will use a method to better organize the code.
			case 'keyup':
				this.#handleKeyEvent(evt);
				break;
				// ...
		}
	}

	// Handles the keyboard events...
	#handleKeyEvent(evt: KeyboardEvent) {
		// We only care about the "space" and "enter" keys.
		if (evt.key !== ' ' || evt.key !== 'Enter') {
			return;
		}

		this.#doButtonAction();
	}
}
```

## Awareness of it's surroundings

Now we are getting into attribute territory, before that, all behaviours present on this button are implicitly added by the browser!

This is where buttons start to interact with other elements around it.

From MDN's docs on buttons, the first attribute listed is [`autofocus`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#autofocus). Let's use that as a starting point for the pattern to handle attributes we will use.

One caveat: as `autofocus` is a global attribute, we are _fighting against the browser_ and have to get creative with naming here.
But then, isn't exactly this fighting the browser and recreating things what react does best?

```typescript
class SaganButton extends HTMLElement {
	// First we need to specify which attributes will be observed.
	static observedAttributes = ['auto-focus'];

	// We will use getters and setters for the attributes and directly manipulate the html.
	// That will allow us to keep HTML attributes and element properties in sync.
	set autoFocus(newValue: boolean) {
		this.toggleAttribute('auto-focus', newValue);

		// If the attribute is set, we focus the element
		if (newValue) {
			this.focus();
		}
	}

	get autoFocus(): boolean {
		return this.hasAttribute('auto-focus');
	}

	// When the HTML value changes, set the property.
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'auto-focus':
				// Note: removed attributes have a value of `null`.
				// Here we only want to know if the value exist or not.
				// The actual value does not matter for boolean attributes.
				this.autoFocus = newValue !== null;
				break;
		}
	}
}
```

## Disabled state

Moving on to the `disabled` attribute, this one is simpler. We set the `ariaDisabled` property of the `elementInternals`.

```typescript
class SaganButton extends HTMLElement {
	static observedAttributes = [
		'disabled'
		// ...
	];

	// Again: using a getter and a setter.
	set disabled(newValue: boolean) {
		this.toggleAttribute('disabled', newValue);

		// Note: `aria-disabled` is a string of "true" or "false", not a boolean.
		this.#internals.ariaDisabled = newValue ? 'true' : 'false';
	}

	get disabled(): boolean {
		return this.hasAttribute('disabled');
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// ...

		switch (name) {
			case 'disabled':
				this.disabled = newValue !== null;
				break;
				// ...
		}
	}
}
```

## Form association and button type

Here is a handful of attributes, all related to forms:

- `type`: The button type, it can be one of 3 options (`submit`, `reset`, `button`). The options trigger the associated form submission, form reset, or don't do anything.
- `form`: the associated form, this is useful for the case where the button is not a child of the form element.
- `formaction`: a URL to submit the form to, this is so you can have different buttons submitting the form to different URLs.
- `formmethod`: Same as the above, different buttons can send different methods. HTML baby!
- `formenctype`: This also allows for different ways of sending the form data over the wire[^3].
- `formnovalidate`: Says this button should skip form validation.
- `formtarget`: If the form should open a new tab on submission or not.
- `name` and `value`: if present it is added to the form on submission.

Well... Let's get to writing all that down...

```typescript
class SaganButton extends HTMLElement {
	// For delegating form association to the browser,
	// We need to add this property.
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

	// The default for button types is "submit",
	// So we validate and default to it.
	set type(newValue: string | null) {
		if (['submit', 'reset', 'button'].includes(newValue)) {
			this.setAttribute('type', newValue);
		} else {
			this.setAttribute('type', 'submit');
		}
	}

	get type(): string {
		// If it is not set we still want to return a default.
		return this.getAttribute('type') ?? 'submit';
	}

	set form(newValue: string | null) {
		if (newValue === null) {
			this.deleteAttribute('form');
			return;
		}

		// Here we need to check if the form is a valid element.
		// If it is, we then set the attribute.
		const form = document.getElementbyId(newValue);
		if (form) {
			this.setAttribute('form', newValue);
		}
	}

	get form(): HTMLFormElement | null {
		// Here we get from the attribute as the first option,
		// Then fallback to whatever the browser has set.
		let form = this.#internals.form;

		const formId = this.getAttribute('form');
		if (formId) {
			form = document.getElementbyId(formId);
		}

		return form;
	}

	set formAction(newValue: string | null) {
		if (newValue === null) {
			this.deleteAttribute('formaction');
			return;
		}

		this.setAttribute('formaction', newValue);
	}

	get formAction(): string | null {
		return this.getAttribute('formaction');
	}

	set formMethod(newValue: string | null) {
		if (['post', 'get', 'dialog'].includes(newValue.toLowerCase())) {
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
		if (['_self', '_blank', '_parent', '_top'].includes(newValue.toLowerCase())) {
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
			this.deleteAttribute('name');
			return;
		}

		this.setAttribute('name');
	}

	get name(): string | null {
		return this.getAttribute('name');
	}

	set value(newValue: string | null) {
		if (newValue === null) {
			this.deleteAttribute('value');
			return;
		}

		this.setAttribute('value');

		// We need to set the button's value.
		this.#internals.setFormValue(newValue);
		// And it's validation state.
		this.#internals.setValidity({});
	}

	get value(): string | null {
		return this.getAttribute('value');
	}

	// We also need to add the validation state of the button...
	get willValidate() {
		// All those checks come from MDN's docs on the button `willValidate` property.
		if (this.type === 'button' || this.type === 'reset') {
			return false;
		}

		if (this.closest('datalist')) {
			return false;
		}

		if (this.disabled) {
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

	attributeChangedCallback(name, oldValue, newValue) {
		// ...

		switch (name) {
			case 'type':
				this.type = newValue;
				break;
			case 'form':
				this.form = newValue;
				break;
			case 'formaction':
				this.formaction = newValue;
				break;
			case 'formmethod':
				this.formmethod = newValue;
				break;
			case 'formenctype':
				this.formenctype = newValue;
				break;
			case 'formnovalidate':
				this.formnovalidate = newValue !== null;
				break;
			case 'formtarget':
				this.formtarget = newValue;
				break;
			case 'name':
				this.name = newValue;
				break;
			case 'value':
				this.value = newValue;
				break;
				// ...
		}
	}
}
```

Okay, after a wall of text, we get to the action. What we actually _do_ once the button is pressed. We defined a `#doButtonAction` method but didn't implement it.

Now is the time to implement the logic for the button action:

```typescript
class SaganButton extends HTMLElement {
	#doButtonAction() {
		// First check if the button is disabled,
		// On that case nothing should happen.
		if (this.disabled) {
			return;
		}

		// Then check the button type.
		if (this.type === 'button') {
			// Do... something else?
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

We _could_ also handle all the validations and form submission by ourselves, including emitting the proper events ourselves. But this has been painful and long enough as it is.
So to avoid more self inflicted pain, in the end, we let the browser handle the form submission.

## ARIA states and newer APIs

There are other ARIA states that affect buttons. Those will require a developer to write code specifically for that.

On the flip side, there are APIs like the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), or [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API), or even the experimental [Interest Invoker API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers). Those APIs bring more features to HTML in a way that is easy for developers to use and sets all the required parts for you.

I will skip those though because they require extra code or relate to other elements _around_ the button. Also this post is already around 3000 words, so yeah...

## In closing

**USE THE DAMN HTML!**

That's is. Don't reinvent the wheel if you don't need to.
It is too much work, and extra burden for you to maintain.

[^1]: In this case "see" is working both as visibly seeing the thing on the screen but also, hearing the element being announced, or getting it represented in the accessibility tree somehow that represents what is expected. And that was a very convoluted way to put it...

[^2]: For a little while now, also aiming to improve compatibility with a more generic API, mouse and touch events are now also pointer events.

[^3]: In modern development, where everything is sent to the server as JSON, this is a forgotten piece of how basic HTML can do _a lot_!
