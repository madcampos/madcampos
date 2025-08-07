---
title: Form validation with (almost) no JS
summary: A view on how to do form validation using mostly HTML and CSS.
image: ./assets/tojs-forms.png
imageAlt: A parchement page showing a drawing of Tiamat, the god dragon from Dungeons & Dragons on the left side.
event: "TorontoJS [ ONLINE ] TechTalk /w Evert Pot & Marco Campos: Choosing Arhitecture For Small Projects / Form Validation With Almost No Javascript"
eventUrl: https://guild.host/events/torontojs-online-techtalk-z9gqim
isOnline: true
date: 2024-08-29
slides: https://1drv.ms/p/s!AivyfQGK_lAiysNtXGfNfJvYfM8edA?e=aFtBFR
video: https://www.youtube.com/watch?v=1DtWgmMAI60
code: https://github.com/madcampos/dnh
techStack:
  - HTML
  - CSS
  - Almost no JS
---

In this talk I go over forms and the things we can do with them without needing JS and how far we can get with only HTML and CSS.

## Forms are hard

Form validation is very hard, specially because most of the time we have weird requirements to fulfill, like the [password game](https://neal.fun/password-game/).

What makes forms worse is bad design and UX. Have you ever found a paper form that you have to fill and the questions are ambiguous? Or the answers do not apply to you? Or even worse the answer is _technically_ correct, but doesn't make complete sense?

Yeah, you found a bad form... Unfortunately, they are the majority, but with a little bit of care, they don't have to be that way.

## Rule of the least Powerful

We should stick to the least powerful tool to the job, that makes our applications more resilient, accessible, and lighter.

The web works well and is compatible because it builds it's foundation on the simplest tools for the job, that is, structuring content with HTML, styling it with CSS, and only then adding behaviors with JS.

## HTML Base

Start with a basic HTML form and then add features _as needed_!

HTML attributes get you very far, here is a non exhaustive list of attributes to use:

- [`required`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/required): that makes your field be required and the form stop from submitting without it being filled;
- [Input `type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types): provides useful ergonomics and UI for different types of data, like numbers or dates;
- [`min`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/min) and [`max`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/max): the minimum and maximum values for dates and numbers;
- [`<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) element: used for suggestions, can be even made dynamic;
- [`pattern`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern): provides a way to use regular expressions for validation;
- [`inputmode`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode): gives the browser a hint on what type of keyboard to show on mobile;
- [`autocomplete`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete): make user lives easier, use it! This provides various hints for what type of data the field is expecting so it can be auto completed with user data.

## CSS Wizardry

There was a time when we couldn't do any input validation or hint to that in CSS, that changed with the introduction of selectors like [`:invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:invalid). It is cool but _very trigger happy_ and will say a field is invalid even if the user have not touched it yet and the page had just loaded.

Then we found some clever hacks like:

```css
input:not(:placeholder-shown):not(:focus):invalid ~ .error-message { display: block; }
```

Breaking it down this monstrosity selector means:

> Style an `error message` that _comes immediately after_ (`~`) an `input` that does `not` have a `placeholder visible`, and is `not` `focus`ed, and is `invalid`.

That is a mouthful and a hack!

Now we have better solutions like the [`:user-invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid) selector that will only match if the user has _interacted_ with the input, easier and better!

If we combine with a wrapper element and the [`:has`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) selector this gives us something like:

```css
.wrapper:has(:user-invalid) .error-message { display: block; }
```

That translates to:

> When a `wrapper` has an element that is `invalid after user interaction`, style the `error message` inside the `wrapper`.

Easier to understand and less hacky!

## JS Validation API

The JavaScript validation API is... bad...

It is not extensible, had awful accessibility, and is very weird to work with. But we can leverage that to be only used when we absolutely need extra powers that are not provided already by HTML and CSS, so we can keep that to a minimum.

One example is when we need to apply logic like "check at most 3 options". That is a case that is complex enough that it is not covered by the built-in validation on HTML and have to be implemented in JavaScript. But one question is, how often are those kinds of validation really needed?

## It has to go to the server anyways

Yes, client side validation is cool and we should provide it as a tool to help users recover from errors sooner.

One example is number input, by default, they don't block users from entering text, and that is okay. But on places like mobile, where a different keyboard is shown to users, they help by _providing guardrails_ to users.

But even with those guardrails users can still send invalid data in a myriad of ways, so we still need to validate data on the server. The point is that client side navigation won't and should prevent all errors, but it helps mitigate those by _guiding_ users to the correct path.

## References

- https://racheleditullio.com/talks/accessible-forms/
- https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/
- https://www.deque.com/blog/anatomy-of-accessible-forms-error-messages/
