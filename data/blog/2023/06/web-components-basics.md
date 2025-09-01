---
title: "Web Components: A (Not So) Gentle Introduction"
createdAt: 2023-06-26T22:55:28.000-04:00
updatedAt: 2024-02-02T03:21:00.000-05:00
updates:
  - date: 2023-07-21T02:11:12.000-04:00
    changes: Added cross-link to tabs post.
  - date: 2024-01-29T00:36:05.000-05:00
    changes: Updated embedded codepen iframe.
  - date: 2024-02-02T03:21:00.000-05:00
    changes: Added an image to the post.
summary: A brief introduction to web components.
image: ./assets/dad-jokes.jpg
imageAlt: 'A pop art style image of a guy dressed in a shirt with an orange tie, holding a microphone and laughing hard. The background is a brick wall with splatters of white and blue paint.'
tags:
  - web
  - web-components
  - JavaScript
  - html
  - CSS
  - BuildInTheOpen
  - BuildingInPublic
  - BreakIntoTech
  - LearnToCode
  - FrontendDevelopment
relatedPosts:
  - tabs-web-component
---

**Note**: Please don't take this post seriously, it contains irony. If you are _not_ immune to it, go vaccinate yourself and come back later.

## What Are Web Components?

You may be wondering: What the flying spaghetti monster is a web component?

Glad you asked! They are a shiny and cool set of technologies to build reusable components for the web.

## But I Already Have `<Insert Framework Here>`!

Well, that is awesome, although the framework you most probably are talking about is [react](https://react.dev/) or one of it's [less](https://angularjs.org/) [popular](https://svelte.dev/) [cousins](https://vuejs.org/).
But let me tell you something: react is a pile of garbage. #hot-take 🔥

Now that we got that out of the way, let's talk about web components and why they are cool.

## Why They Are So #cool?

The main reason is because it is native to the web, so we don't need to load extra libraries or frameworks to use them.

They also bring the promise of dropping any new component in and just use it, without having to worry about build tools, compatibility or anything else. They are also easy to integrate with any framework you may be using because it is just an HTML element.

_I_ particularly like them because they are close enough to how the web platform works that you can understand them without having to learn new hard to grasp concepts. Yes, I'm looking at you [currying](https://en.wikipedia.org/wiki/Currying).

## The Technical, Boring, Not Fun, Stuff

There are three main technologies that make up web components:

- [HTML Templates](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template): A nice element that allows you to create and have the browser parse a DOM tree for you but _without_ having to add it to the page or impact performance.
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM): A mechanism to encapsulate a DOM tree. Think the controls on a `<video>` or `<audio>` tag, invisible to us but still there.
- [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements): The final boss of Web Components. They allow us to create custom HTML tags, and that friend is how we can create reusable components.

## The `<template>` Element

It is useful for other things in general, but this tag really shines when we use it to create [Declarative Shadow DOM](https://developer.chrome.com/articles/declarative-shadow-dom/).

Unfortunately browser support is [not there yet](https://caniuse.com/declarative-shadow-dom), so I'll skip it for now.

## The Fun Stuff

Let's create a infinite scroller component that load dad jokes, because why not?

### The HTML

```html
<dad-jokes-bonanza></dad-jokes-bonanza>
```

Yes, that is all. The component is a new HTML tag, `<dad-jokes-bonanza>`, that we can use anywhere in our page.

The only hard requirement is that the tag name must have a `-` in it so it doesn't conflict with existing and future HTML tags.

### The JavaScript

Here is where the magic happens, we will write the following pieces:

1. Create a class that extends `HTMLElement`.
2. Create a Shadow DOM that has a "container" and a "loader" element.
3. Create a `IntersectionObserver` that will trigger when the loader element is visible. When the loader is visible, we will fetch more jokes and add them to the container.
4. Register the component so it works.

The base of the component is really simple, it just creates a new class that extends `HTMLElement`, and then we create a `constructor` method.

```javascript
class DadJokesBonanza extends HTMLElement {
	constructor() {
		// Calling `super` is required or else we don't create an element and the browser will yell at us.
		super();
	}
}
```

After that we will create a Shadow DOM on the constructor, that will be all the internal HTML for our component. Like with the `<video>` tag, everything inside here will be invisible to the outside world.

```javascript
class DadJokesBonanza extends HTMLElement {
	// Properties starting with `#` are private, so we have an extra mechanism to keep the logic inside the component.
	#shadowRoot;
	#loader;
	#container;

	constructor() {
		super();

		// Create a shadow DOM
		this.#shadowRoot = this.attachShadow({ mode: 'open' });

		// Adding a container for the jokes
		this.#container = document.createElement('div');

		this.#container.id = 'container';
		this.#shadowRoot.appendChild(this.#container);

		// Adding a loader
		this.#loader = document.createElement('hr');

		this.#loader.id = 'loader';
		this.#shadowRoot.appendChild(this.#loader);
	}
}
```

Now we need to create a `IntersectionObserver` that will trigger when the loader is visible. We do that on one of the [lifecycle methods](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#using_the_lifecycle_callbacks) of the component, `connectedCallback`.

(Previous code omitted for brevity)

```javascript
class DadJokesBonanza extends HTMLElement {
	// We will use this to avoid calling the API multiple times.
	#isLoading = false;
	#observer;

	connectedCallback() {
		// Create an observer that will trigger when the loader is visible
		this.#observer = new IntersectionObserver(async ([entry]) => {
			if (entry?.isIntersecting && !this.#isLoading) {
				this.#isLoading = true;

				try {
					// Fetch jokes then add items to the container,
					// Those functions are ommited here for brevity.
					const jokes = await this.#fetchMoreJokes();

					this.#addJokes(jokes);
				} catch (err) {
					console.error(err);
				}

				this.#isLoading = false;
			}
		}, {});

		// Observe the loader element
		this.#observer?.observe(this.#loader);
	}
}
```

Finally, we need to register the component so it works. We do that by calling `customElements.define` with the name of the component and the class we created.

```javascript
// It is a good practice to always check if the component is already registered.
// This is useful to avoid errors when importing the component multiple times from a single file.
if (!customElements.get('dad-jokes-bonanza')) {
	customElements.define('dad-jokes-bonanza', DadJokesBonanza);
}
```

## Putting It All Together

You can check out the full code on CodePen: https://codepen.io/madcampos/pen/WNxYoPv

::codepen[Dad Jokes - Infinite Scroller]{#WNxYoPv username=madcampos}

I intentionally left styling and some complexities related to components to make the post brief and easy to follow.
The API is extremely powerful and let's us do a lot... but that is for [other posts](/blog/2023/07/tabs-web-component/).
