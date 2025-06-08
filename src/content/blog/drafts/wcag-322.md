---
title: Meeting WCAG Success Criteria 3.2.2
summary: Notes on one of the WCAG success criteria
createdAt: 2025-05-17T14:32:54.600-04:00
draft: true
tags:
  - Accessibility
  - a11y
---

There is a saying in Brazil that goes like this:

> _If there is a rule, there is a story \[behind it]._

Every time I'm reading a set or rules and regulations some of those oddly specific rules stand out and they make me wonder why that rule exists?

This time, I was writing an accessibility report, so I had to go over all of the success criteria (SC) of WCAG. _SC 3.2.2 - On Input_ stood out to me. Here is it's description:

> Changing the setting of any [user interface component](https://www.w3.org/TR/WCAG21/#dfn-user-interface-components "a part of the content that is perceived by users as a single control for a distinct function") does not automatically cause a [change of context](https://www.w3.org/TR/WCAG21/#dfn-change-of-context "major changes that, if made without user awareness, can disorient users who are not able to view the entire page simultaneously") unless the user has been advised of the behavior before using the component.

Translating from tech jargon, and with the help of the more descriptive ["Understanding SC 3.2.2"](https://www.w3.org/WAI/WCAG21/Understanding/on-input.html) page, we can figure out that this SC is not met if by changing anything other than links or buttons will move the user to a different page of part of the application.

## [A bridge themed example](https://www.youtube.com/watch?v=LsXvBfEr_rs)

We have the following form:

```html
<form action="/another-page">
	<p><strong>Question:</strong> What is the airspeed velocity of an unladen swallow?</p>

	<p><strong>Answers:</strong></p>
	<div>
		<input type="radio" name="answer" id="answer-1"/>
		<label for="answer-1">Fast</label>

		<input type="radio" name="answer" id="answer-2"/>
		<label for="answer-2">1 520 640 in/s</label>

		<input type="radio" name="answer" id="answer-3"/>
		<label for="answer-3">An European or an African swallow?</label>

		<input type="radio" name="answer" id="answer-4"/>
		<label for="answer-4">11 m/s</label>
	</div>

	<script>
		document.querySelectorAll('form input').forEach((input) => {
			input.addEventListener('change', () => {
				document.querySelector('form').submit();
			});
		});
	</script>
</form>
```

This form has no submit button, but selecting any of the radio buttons will make the form get submitted and send the user to another page without warning.
