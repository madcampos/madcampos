---
title: Web Components Accessibility
summary: A summary of what tools and accessibility there is for web components
image: ./assets/sunglass-tree.jpg
imageAlt: A tree made out of circuit lines, in some branches there are colorful sunglasses.
createdAt: 2024-06-11T19:00:08
tags:
  - a11y
  - Accessibility
  - coding
  - web-components
  - WebDevelopment
  - FrontendDevelopment
---

Yesterday I woke up to a notification on Slack, tagging me to answer a question:

> How accessible are web components?

After a very long answer, I decided to turn _that_ content into _this_ content. The following post it an expanded version of my comment.

## To Shadow DOM or not to Shadow DOM?

Let's recap a little bit on the basics of web components...

The Shadow DOM is a way to encapsulate and hide the implementation of your components, much like the `video` and `audio` tags have controls like play and pause buttons and a seek bar, web components can also have "hidden parts" that are there but not exposed to the page. You only have one single tag on the page and not a bunch of things for all the parts _inside_ that tag.

You can read more about web components on those two posts:

- [Web Component: A (Not So) Gentle Introduction](/blog/2023/06/web-components-basics/)
- [Tabs, Tabs, Tabs](/blog/2023/07/tabs-web-component/)

Okay, back to the Shadow DOM, you can either use it, or not. Below are two examples, the first without a Shadow DOM and the second one with it (using [Declarative Shadow DOM](https://developer.chrome.com/docs/css-ui/declarative-shadow-dom)).

```html
<component-without-shadow>
	<h1>A rogue H1 appears in the wrong place!</h1>
	<button type="button">Click Me!</button>
	<p>Some extra text to the component</p>
</component-without-shadow>
```

```html
<component-with-shadow>
	<template shadowrootmode="open">
		<h1>A rogue H1 appears in the wrong place!</h1>
		<button type="button">Click Me!</button>
		<p>Some extra text to the component</p>
	</template>
</component-with-shadow>
```

Both examples will handle the button focus as expected and show the button focus on the accessibility tree. But the one with the Shadow DOM will not add the `h1` and `p` tags to the accessibility tree.

So, let's answer this first part about accessibility with a quote:

> "It depends"
> -- Senior Developer

Okay, _how_ does it depends? If you only care about focusability, it will be just fine, maybe a little bit weird though.

However, if you want to expose more information to the accessibility tree, then the next solutions are what you are looking for.

## The first rule of ARIA...

As everyone know, the first rule of ARIA is: don't use ARIA!

Oh, you didn't? Shame...

![A gif from Game of Thrones showing a nun with a serious face walking down a medieval street. She is ringing a bell. Overlayed on the gif are the words: "SHAME. SHAME. SHAME."](./assets/shame-got.gif)

Jokes aside, using any of the `aria-*` attributes will _OVERWRITE_ the default attributes for that element, and break expectations, and make it confusing to users. It is better to have a shitty experience that still works than an experience that doesn't work and is shitty on top of that.

Okay, with that out of the way, unfortunately until as recently as March 2023 the only way to make a web component anything other than a `role=generic` element was to add a `role` attribute and all the needed `aria-*` attributes related to that role.

This works, but is not pretty... Back to our original question, one way to make web component accessible is add the needed ARIA attributes to the component.

Here is an example on how to do that from inside the component:

```typescript
export class SemiAccessibleComponent extends HTMLElement {
	constructor() {
		super();

		this.attachShadow();
		this.shadowRoot.innerHtml = 'Content from inside a custom region';

		this.setAttribute('role', 'region'); // [!code highlight]
		this.setAttribute('aria-label', 'Custom region from a web component'); // [!code highlight]
	}
}

customElements.define('semi-accessible-component', SemiAccessibleComponent);
```

You can also do this from the HTML side:

```html
<semi-accessible-component role="region" aria-label="Custom region from a web component"> <!-- [!code highlight] -->
	<template shadowrootmode="open">
		Content from inside a custom region
	</template>
</semi-accessible-component>
```

Those are very valid solutions, but what is the fun in that? 🙃

We want our nice web component to be accessible without exposing it's internals.

![An image of a laptop's ethernet port with two hands, one holding a cable and the other holding a condom between the port and the cable.](./assets/protect-yourself.png)

## Keeping in the Shadow DOM

There is a new way to control the accessibility of a web component: the [`attachInternals`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals) method. It achieved [baseline](https://web.dev/baseline) status of "Newly Available" on March 2023[^1].

So, what this API does and why should we care? This API is a combination of two things: forms and accessibility, _because what could go wrong there_? (sarcasm intended)

It is a method that you call when constructing your component that gives you _full control_ over the component to expose it as a form element and to the accessibility tree.

For forms it means you can implement all of the cool form validations and expose it to parent `form` element **_as if it was_** a regular form element (i.e. `input`, `select`, `button`, and `textarea`). That means, _if well implemented_[^2], you can just pop a web component that implements something complex as a date picker and it will work with your `form` _as if it were_ a boring and vanilla `input`.

Now for the part we care more here, the accessibility of `attachInternals`. It exposes programatic equivalents to `role` and all of the static `aria-*` attributes. That means we can set that information when creating or manipulating the element.

I've wrote a full featured example for that on the post "[Tabs, Tabs, Tabs](/blog/2023/07/tabs-web-component/)". The code example is here: https://codepen.io/madcampos/pen/NWEzogQ.

As an aside, this is the best reference ever for how to implement complex interactions on the web: [https://www.w3.org/WAI/ARIA/apg/patterns/](https://www.w3.org/WAI/ARIA/apg/patterns/). The pattern I used to implement the tabs web component is straight from this list and I got positive feedback that it is indeed accessible.

The only "drawback" on `attachInternals` in my opinion is that it doesn't expose equivalents to ARIA attributes that _reference_ things, so you have an equivalent of `aria-label` _but not_ `aria-labeledby`! That functionality of finding an element and then referencing it has to be implemented by yourself using `querySelector` and friends and then setting the properties or attributes on the element yourself, like the [previous exemple](#the-first-rule-of-aria).

## Is it Focuses or Foci?[^3]

Lastly, there is an interesting part to all this: [`delegateFocus`](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus).

This one is tricky and honestly I don't understand it completely either...

As far as the common use case for it goes, it allows us to manipulate the focus order inside the Shadow DOM, so the correct element gets focused when you move into the web component. Think a custom `dialog` with a close button or a complex `input` with multiple parts.

The `delegateFocus` attribute will help managing the internal focus of the element. An interesting, albeit technical, post from the work group that _writes the HTML specification_ is [available here](https://blog.whatwg.org/focusing-on-focus). It goes more in depth on all the focus logic everywhere.

The way I use `delegateFocus` is by testing it thoroughly. If you only have one focusable element inside your web component like a single `button`, it will be just fine and you don't need the extra headache.

## In closing

Well, that was a lot...

The TL;DR version is: web components can be made accessible, but they don't break expectations as some frameworks do (I'm shaming react specifically 🔥). Web components _do_ still require a little bit of love to make things nicer, specially on more complex interactions.

[^1]: That [baseline](https://web.dev/baseline) status means since March 2023 it is available on all major browsers and can be used by the majority of users. If your users are on updated browsers you are good to go, but a polyfill may still be required.

[^2]: The key part here is "if well implemented", that is hard and requires a lot. Here is an example of a reimplementation of the HTML input, it is not accessible, just exposes the validation and form API: https://github.com/madcampos/sdrlog/blob/main/src/components/SdrEditBox/index.ts

[^3]: Both are correct plural forms of "focus" in English, you can say "focuses" and no one will care, but if you use the more formal form of "foci" people will probably take note on how annoying you are.
