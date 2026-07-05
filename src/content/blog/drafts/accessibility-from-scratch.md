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

If that didn't scare you already of trying to re-implement a button from scratch, buckle up, because we will do it and I hope _that_ will discourage you.

## The button base

First thing is to create a new tag, we do so because custom tags have no implicit role associated with them. So we add a `role` of `button` to it.

```html
<sagan-button role="button">A button from scratch</sagan-button>
```

So far so good...

## Click, touch, and pointers

Browsers are pretty nice and provide some mappings to those events, to the [`click`](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event) event. Or at least the most common browsers do that.
The problem is exactly on when it _doesn't_ map: our case with a completely custom, made from scratch button.

So we have to add the events. Starting with click.

```html
<sagan-button
	role="button"
	onclick="console.log(event)"
>
	A button from scratch
</sagan-button>
```

For completeness sake, let's also add two more events:

- `ontouchend` for handling when the user lifts their finger from the element. There is no equivalent of the `click` event for touch.
- `onpointerup` for handling other pointer devices, like styluses. Again, there is no equivalent of the `click` event here.

Now our component looks like this:

```html
<sagan-button
	role="button"
	onclick="console.log(event)"
	ontouchend="console.log(event)"
	onpointerup="console.log(event)"
>
	A button from scratch
</sagan-button>
```

And complexity piles up, let's now move to keyboard interactions...

[^1]: In this case "see" is working both as visibly seeing the thing on the screen but also, hearing the element being announced, or getting it represented in the accessibility tree somehow that represents what is expected. And that was a very convoluted way to put it...
