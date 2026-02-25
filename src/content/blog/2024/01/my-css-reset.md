---
title: My CSS Reset
createdAt: 2024-01-18T11:00:00.000-05:00
updatedAt: 2024-02-02T03:21:00.000-05:00
updates:
  - date: 2024-02-02T03:21:00.000-05:00
    changes: Added an image to the post.
summary: A breakdown of my CSS reset file and why each piece is there.
image: ./assets/justyn-warner-VH8w75u3LE0-unsplash.jpg
imageAlt: A photo of a blank canvas on an easel.
imageRights: "Photo by [Justyn Warner](https://unsplash.com/@justynwarner?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/brown-wooden-table-with-white-wall-VH8w75u3LE0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)"
tags:
  - CSS
  - html
  - web
---

I was reading a newsletter the other day[^1] and an article caught my attention: [My CSS Resets](https://keithjgrant.com/posts/2024/01/my-css-resets/).
This reminded me of a couple of articles I read last year.

- [A (more) Modern CSS Reset](https://piccalil.li/blog/a-more-modern-css-reset/) by [Andy Bell](https://piccalil.li/)
- [Being Picky about a CSS Reset for Fun & Pleasure](https://chriscoyier.net/2023/10/03/being-picky-about-a-css-reset-for-fun-pleasure/) by [Chris Coyier](https://chriscoyier.net)

And how I approach CSS resets. So, I decided to comment on it because I'm a person on the internet and I have _a moral obligation_ to do that.

Brace yourselves, strong opinions incoming!

![An image composed of four panels, the three first are stretching exercises and the forth one is a finger pressing the "Caps Lock" button.](./assets/arguing-on-the-internet.jpg)

## What is a CSS reset?

In the old times of Internet Explorer and using tables for layouts, browsers were quite inconsistent in their results. Nowadays, while they are still very different on the inside, browsers tend to have consistent output, so you can expect things to look "similar enough"[^2] in different browsers.

Those browser differences of yore caused problems! So developers came up with the idea of starting a project with a "reset". That would put all browsers on the same baseline and _revert_ all inconsistencies to a more sane default.

## Do you need a CSS reset?

No. But old habits die hard and here is where we are...

I think you could say it is more of a "starting point" CSS file rather than a "reset" itself as some settings are very specific to my tastes. It still provides a baseline to start building upon.

## My CSS "reset"

Here is the full reset file, following is a breakdown of each part.

```css
:root {
	box-sizing: border-box;
	accent-color: #0080ff;
	color-scheme: dark light;
	font-size: 20px;
	font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

*, *::before, *::after { box-sizing: inherit; }

:not(:defined) { display: none; }

html, body { height: 100%; }
body { margin: 0; }

button, input, textarea, select { font: inherit; }

img, picture, svg, canvas, audio, video {
	display: block;
	max-inline-size: 100%;
	block-size: auto;
}
```

Okay, now for each part and _why_ it is there.

### "T" is for Typography

```css
:root {
	font-size: 20px;
	font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
```

The default font part here is two fold:

1. It sets the `font-family` to be the sans-serif font used for the browser UI, it is decent enough. But depending on the project I set the font here to some other that I may be using.
2. The `font-size` is so we don't have to deal with tiny text. As much as my myopic eyes love a tiny font, it is more comfortable to have a larger one, specially on mobile. Remember folks: we all have temporary disabilities at some point, so think accessibly _as a baseline_!

### Styling forms is finally nice

```css
:root { accent-color: #0080ff; }
```

When you set the [`accent-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color) for your page, all controls will render with that colour instead of whichever default the browser uses. Checkboxes, radio buttons, selects and other widgets will look nicer without much effort. Here I'm just setting it to my theme colour because branding is important.

### Come to the dark side

```css
:root { color-scheme: dark light; }
```

The [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) is used to set the page to render first in dark mode, and then in light mode. Note that it means that the page _can_ be rendered in both modes because it lists both values, but _prefers_ dark over light.

### The infamous CSS box-model

```css
:root { box-sizing: border-box; }

*, *::before, *::after { box-sizing: inherit; }
```

So... let's address [the box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model) in the room.

When CSS was created, the way an element's size would be calculated would be a sum of all things that count for its size.

For example:

> If you set a `width` of `100px`, a `margin` of `1px`, a `padding` of `2px`, and a `border` of `3px`.
> Your box would have a _total size_ of `100px + (1px * 2) + (2px * 2) + (3px * 2)` for a total of `112px`!

![The meme of "Math Lady", with four panels focusing on the face of a wooman looking clearly confused. Overlayed on the panels are multiple math equations.](./assets/nazare-confusa.jpg)

So, this makes some complex layouts get _more_ complex and _faster_. Ironically, we got saved by Internet Explorer who had the sane idea of calculating the size by setting it based on the `width` and then _subtracting_ things from it to get how much space is left for the content.

Back to the previous example:

> If you set a `width` of `100px`, a `margin` of `1px`, a `padding` of `2px`, and a `border` of `3px`.
> Your box **in IE** would have a total size of `100` and the _internal size_ of the content would be `100px - (1px * 2) - (2px * 2) - (3px * 2)` for an _internal size_ of `88px`.

Quite confusing, I know. The MDN docs on this are much more thorough and better at explaining the box model: https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model

The problem is, we are used to thinking closer to the way Internet Explorer implemented things than the standard, so the people on the standards got to a compromise and added a property to control it: [`box-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing).

Here I'm setting it to be like Internet Explorer did it and that all elements and pseudo elements (`::before` and `::after`) should follow the same model.

### The hidden skeleton loader

```css
:not(:defined) { display: none; }
```

This rule applies to web components before [they are defined](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#registering_a_custom_element). It simply hides components that the browser doesn't know how to handle yet so they don't show.

I started working a prototype for adding skeleton loaders to undefined elements awhile back, but it is very bare _bones_ (pun intended): https://codepen.io/madcampos/pen/VwVMQQp

### Mind the gap

```css
html, body { height: 100%; }
```

When we create a page, the `body` element doesn't fill the available vertical space. This is a small trick to make it fill the available space without getting into the confusing world of viewport units.

### Don't hug the page

```css
body { margin: 0; }
```

This is one of the oldest rules from resets. It simply removes an `8px` margin that browsers add to the body element. It does make sense when you think about text heavy pages that work more like Wikipedia than a Single Page Application.

Browsers still add this rule to their default stylesheet because one of the golden rules of the web is: "don't break compatibility". That is why the [Space Jam website from the 90's](https://www.spacejam.com/1996/) still works fine in modern browsers without issues.

### Styling forms is finally nice 2: Electric Boogaloo

```css
button, input, textarea, select { font: inherit; }
```

By default, forms use the system font, size and other characteristics. This rule simply makes them play nice with their friends by inheriting everything font related.

### Things that are not text

```css
img, picture, svg, canvas, audio, video {
	display: block;
	max-inline-size: 100%;
	block-size: auto;
}
```

I'm gonna quote Keith's post here:

> I can't recall the last time I used an `<img>` as an inline element. They're almost always part of the page structure, so I make them block level.

Usually all those elements are used as block level elements that span the whole width of the page, so this rule makes them behave like this.

### `<footer>`

And that is it for my CSS reset. Although browsers are much better and more compatible with each other there are some small quality of life improvements that help us suffer less when debugging.

[^1]: I guess reading newsletters is the millennial version of the boomer who reads the newspaper.

[^2]: By "similar enough", it doesn't mean they will be _pixel perfect_, just that things will behave mostly the same and generate results that, given some wiggle room, are so close to each other that the differences don't matter.
