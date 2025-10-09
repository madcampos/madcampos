---
title: "Back to basics: It's all about the content"
summary: The main content for the "Back to Basics" project.
createdAt: 2025-09-02T19:13:29
draft: true
tags:
  - back-to-basics
  - FrontendDevelopment
  - html
  - web
---

Most of the main content for most pages is very boring HTML. Think your paragraphs, divs (yes, I use divs), and lists. Very boring...

So here is a rundown of some of the cooler and less known or used HTML elements and semantic features.

## The basic sectioning elements

I hope everyone is using `<section>`, `<article>`, `<nav>`, `<header>`, and `<footer>`. If you are not, go learn them!

Do you know a puppy _dies_ every time you use a `<div>` instead of a semantic element?

<!-- TODO: insert puppy image -->

You murder...

Jokes aside, I will not cover them as everyone _should_ be using them _already_.
Even the late IE, God bless their soul, had support for those elements.

## Definition lists

By far this is my favorite HTML element. What more can I say about a list of items that has an attached explanation to them? It _is_ AWESOME!

The whole restaurant menu is built with them, it works perfectly for this kind of information. the way you write it is like this:

```html
<dl>
  <dt>Focaccia</dt>
  <dd>House made focaccia, olive oil, and rosemary.</dd>

  <dt>Brucceta al Pomodoro</dt>
  <dd>Grilled bread topped with marinated tomatoes, garlic, and basil.</dd>

  <dt>Arancini Siciliani</dt>
  <dd>Crispy risotto balls filled with mozzarella and vegan ragù.</dd>

  <dt>Prosciutto e Melone</dt>
  <dd>Sweet cantaloupe paired with smoked mushroom slices, in the style of Parma ham.</dd>

  <dt>Insalata Caprese</dt>
  <dd>Fresh mozzarella, tomatoes, basil, and extra virgin olive oil.</dd>
</dl>
```

Easy, simple, and cool by default. You can style them to be fancier, the end result for the menu has more to it, but there is also a lot that comes from SEO, so the details are for another time.

## Figures

So the `<figure>` element is an interesting one. It resembles the figures in an academic paper, but can be used for more than that. They basically wrap whatever is inside of it with a caption. So it is useful to present tables, images, and other things where you want to say something like "see exhibit A...".

On the restaurant website it is used throughout to associate images with some caption, like saying which item from the menu the photo belongs to.

Please note: It is not a substitute to the alt text, as the alt text actually describe the image _contents_.

Here is an example markup:

```html
<figure>
  <img
    width="480"
    src="/assets/images/pizza.webp"
    alt="A top shot of a pizza topped with olives, onions, zuccini, red and yellow peppers, corn, cilantro, and sesame seeds."
  />
  <figcaption>Brazillian Style Pizza</figcaption>
</figure>
```

## Address

## Quotations

## Horizontal rulers
