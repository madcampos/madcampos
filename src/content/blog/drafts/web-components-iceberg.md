---
title: The web component iceberg
summary: Let's dive into the different levels of web components
image: ./assets/richard-the-iceberg.jpg
imageAlt: A photo of a penis shaped iceberg, with another piece of iceberg in front of it and the city of Harbour Grace, Newfoundland in the background.
createdAt: 2026-10-22T19:18:04.748-04:00
draft: true
tags:
  - HTML
  - Web Components
imageRights: Photo by Ken Pretty
---
Even though it is a few years old, [this article on web components](https://adactio.com/journal/20618) popped on my feed. It ends with an interesting statement:

> React encouraged a mindset of replacement: “forgot what browsers can do; do everything in a React component instead, even if you’re reinventing the wheel.”
>
> HTML web components encourage a mindset of augmentation instead.

That's what I want to talk about today, web components and, appropriating meme culture, the "iceberg" of technologies surrounding the idea.

## Shitting on react

I will never pass the opportunity to complain about react. And the quote above has an interesting thing that I always noticed but had a hard time putting it in words: replacement.

Basically, react doesn't play nice with other parts of the platform, if react doesn't recognize it, it _cannot_ exist. It _must_ not exist. It _does not_ exist.

This creates a situation where there is no simple way of using things like `IntersectionObserver`s with react without very complex wrappers.

Or how users can't type on inputs without react's blessing. This one always baffled me.

Like, _why_?! Just to force data to be "one way" and to have total and complete control over the state of the application, nothing can escape the ever watchful eye of react. Foucault would be proud of the `useState` panopticon.

So, let's offer an alternative on different levels of complexity.

## Surface: HTML only components

By default, when you declare a new tag, it doesn't have any semantics attached, it will simply be an `HTMLElement`. So it is still recognized as an element, but nothing more.

This provides a very good _semantic boundary_ for components and other structural parts of an application. Making it easier to read and query with CSS (more on that in a bit).

Compare this:
```html
<card-component variation="outline">
	<header></header>
	<card-tags compact></card-tags>
	<card-image>
		<img />
	</card-image>
	<card-content></card-content>
	<footer></footer>
</card-component>
```

With this:
```html
<div class="card card_variation_outline">
	<header class="card__header"></header>
	<div class="card__tags card_tags_compact"></div>
	<div class="card__image">
		<img />
	</div>
	<div class="card__content"></div>
	<footer></footer>
</div>
```

At least in my opinion, the markup is much more readable.

## Waterline: Adding CSS

Adding custom named attributes to the element make it so the API is more explicit, and not something crammed into classes trying to match a [weird](https://bem.info/en/methodology/) [naming](https://smacss.com/) [convention](https://www.smashingmagazine.com/2011/12/an-introduction-to-object-oriented-css-oocss/).[^1]

A web component can have arbitrary attribute names, the only place that it may cause some issues is if it overrides one of the [global HTML attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes).
In my experience, the only one to cause problems is `title`, but that is a problematic attribute on itself anyways...

So, the custom named element creates a _boundary_ for us, specially for styling and with native support for nesting, it can help with organization. We move from chained classes to element selectors.

```css
card-component {
	header { ... }
	card-content { ... }
	footer { ... }
	
	card-image {
		img { ... }
	}
	
	
	card-tags {
		...
		
		&[compact] { ... }
	}
	
	&[variation="outline"] { ... }
	&[variation="shiny"] { ... }
}
```

## An aside on CSS layers and scope

If you are not using CSS layers, you should. They make handling things like the _modifier_ part of BEM or library code easier.

You can control the order different layers apply, so overrides for subsequent layers become simpler and the selectors smaller.

Here is how I usually organize my layers:

```css
@layer lib, base, pages, components, themes, accessibility, print;
```

Scope is a newer addition to CSS, but it also provides a way to, you guessed, _scope_ declarations to a selector so those random classes that gets injected by a framework become unnecessary, you can _scope it_  instead.

## Bellow water: events and simple selectors

## Deep water: element registration

## Abyss: shadow DOM

[^1]: Don't get me wrong, all those methodologies are valid, and they try to tackle a hard problem. But CSS evolved since they came out to the point where now we can revisit those methodologies and make them obsolete in favour of other patterns.