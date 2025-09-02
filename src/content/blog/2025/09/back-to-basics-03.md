---
title: "Back to basics: What's in your head?"
summary: The content for the page headers for the "Back to Basics" project.
image:
imageAlt:
createdAt: 2025-09-02T19:13:29
draft: true
tags:
  - back-to-basics
  - FrontendDevelopment
  - html
  - web
---

Okay, so in the previous post the defined content for the header was basically a navigation menu and a hero image/video.

I want to make it as reusable as possible, so we will start with some custom elements:

```html
<header>
  <a id="skip-to-main" href="#main">Skip to main</a>

  <main-menu>
    <button type="button" popovertarget="main-menu-mobile">
      <sr-only>Open menu</sr-only>
      <x-icon role="none" aria-hidden="true"></x-icon>
    </button>

    <dialog popover id="main-menu-mobile">
      <button type="button" popovertarget="main-menu-mobile">
        <sr-only>Close menu</sr-only>
        <x-icon role="none" aria-hidden="true"></x-icon>
      </button>
      <nav aria-labelledby="main-menu-label">
        <sr-only id="main-menu-label">Main Menu</sr-only>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about/">About</a></li>
          <li><a href="/menu/">Menu</a></li>
          <li><a href="/recipes/">Recipes</a></li>
          <li><a href="/book/">Book a Table</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </nav>
    </dialog>
  </main-menu>

  <hero-image>
    <video></video>
  </hero-image>

  <hgroup>
    <h1>Marco&rsquo;s Trattoria</h1>
    <p>A delight in each bite</p>
  </hgroup>

  <hero-controls hidden>
    <button type="button" id="video-play-pause-button">
      <span id="video-play-icon">
        <sr-only>Play Video</sr-only>
        <x-icon role="none" aria-hidden="true"></x-icon>
      </span>
      <span id="video-pause-icon" hidden>
        <sr-only>Pause Video</sr-only>
        <x-icon role="none" aria-hidden="true"></x-icon>
      </span>
    </button>
    <button type="button" popovertarget="video-description">
      <sr-only>Video Description</sr-only>
      <x-icon role="none" aria-hidden="true"></x-icon>
    </button>
    <dialog popover="auto" id="video-description">
      <header>
        <h2>Video Description</h2>
        <button type="button" popovertarget="video-description">
          <sr-only>Close Video Description</sr-only>
          <x-icon role="none" aria-hidden="true"></x-icon>
        </button>
      </header>

      <!--Video description goes here -->
    </dialog>
  </hero-controls>
</header>
```

Okay, that is _a lot_, and there is more as this code is simplified for the post, but most things are here, so let's break it down.

## The accessible things

There are two things of notice here, the first is a link with the text "Skip to content". This link will be styled to be visible only when it gets focus, so by keyboard and screen reader users only. It helps to provide a way to skip all of the fluff of the menu and header of the page.

Along with it, all text that need to be accessible to screen readers, but not visible are wrapped in the `<sr-only>` element. It just makes the text invisible for sighted users, but accessible to screen readers.

That helps to add a textual label to things like buttons that would otherwise only have an icon. And for the icons specifically, as they are described by the screen reader only text before them, they have the `role` set to `none` and the `aria-hidden` set to `true` to hide it from screen readers. Same information conveyed in two different ways so we can make them less duplicated.

## `<dialog>` and `popover`

With a custom element, we get the main menu area, it uses two really cool features: `<dialog>` and `popover`.

### The `<dialog>` element

How to make modals on the web without `z-index` hacks? `<dialog>` is the solution. This element makes easy to create modal _dialogs_.

One of the nice features that enables dialogs is the concept of "top layer". It means the dialog will always be on top of all elements, no matter what, no need to be fiddling with `z-index` to make it on top of everything else.

The other cool feature that is very hard to achieve without is keyboard trapping. The dialog element will trap the keyboard inside it, so tabbing to other elements will not get out of the dialog. This is borderline impossible to do with JS and can get complex quickly.

So yeah, with 0 lines of javascript this just works, well almost...

### The `popover` attribute

To make the modal dialog open and close, there is a set of attributes: `popover` and `popovertarget`.

It basically implements in the browser, no JS needed, a way to connect buttons to a dialog (other elements work as well) and make clicking the button show or hide the elements, as simple as that.

Pretty neat, eh?

## The rest of the menu

Okay, you may be asking why all this complexity for a menu, where we can get it to show nicely with just a `display` of `flex`?

Well it is to provide one of those nice hamburger menus on mobile, of course! With the current structure the menu is there, it can be made visible or hidden depending on the viewport size. Just adding some CSS achieves the result.

But then a problem arrises: remember the top layer thing a couple of paragraphs above? Yeah, that... It breaks screen readers as they become trapped on the menu, so for desktop the menu needs to be duplicated _outside_ a `<dialog>`... Oh well... The final code has twice the menus, but they still switch between mobile and desktop. 🤷‍♂️

## The hero ~~image~~ video

For the hero section there are three parts, they are overlap, but should be shown in a sequence.

### The hero itself

First, and on the background of everything is an image or video, this is simple and is achieved by the `<hero-image>` tag and making whatever is inside of it take the full size and set the `object-fit` property to `cover`:

```css
hero-image {
	grid-area: hero;
	align-self: stretch;
	justify-self: stretch;
	height: auto;

	:is(video, img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}
}
```

Yes, it is that simple. CSS is indeed magic!

### The text

Following that the text is wrapped in an `<hgroup>` element to add semantics that this is a heading with a subtitle. The text should then overlay whatever is behind it and be legible, so some things are added to achieve that effect.

### Backdrop filter

One of the properties used here is the `backdrop-filter`, it allows for some image processing filters to apply to whatever is behind the element, in contrast with the `filter` property that applies the filter to the element _itself_.

```css
hgroup {
	backdrop-filter: blur(0.1rem);
}
```

And again, it is _that_ simple.

### The hero controls

My first idea was to add the hero controls to the `<hero-image>` element... But that turned out not nice, as a filter was applied to the buttons and I could not click them. We still need to provide a way for users to pause the fricking video!

And another point: video content _has_ to have alternatives to it. As there is no audio to the video, there is no need for captions or subtitle, but the video is still there. For that we add a video description, again using our friends `<dialog>` and `popover`.

To achieve all of that, the hero controls became it's own element and were placed after the text.

Next up: the main contents.