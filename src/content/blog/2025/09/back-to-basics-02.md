---
title: "Back to basics: HTML structure"
summary: How the HTML is structured for the "Back to Basics" ptoject.
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

As for this project there will not be any magic to combine snippets of HTML into a full page and avoid repetition I would need to copy and paste a lot of code.

So, to avoid editing the same things over and over again (foreshadowing) I decided to get the home page done first and then copy the structure over to the other pages.

## Skeleton of a page

Aside from the obvious `<head>` and `<body>` tags, I still needed a skeleton of a page to get started.

For now, this will do:

```html
<!DOCTYPE html>
<html lang="en-CA">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Marco&rsquo;s Trattoria</title>
	</head>

	<body>
		<!-- #region SVG assets -->
		<svg-defs role="none" aria-hidden="true"></svg-defs>
		<!-- #endregion -->

		<!-- #region Top navigation -->
		<header></header>
		<hr />
		<!-- #endregion -->

		<!-- #region Main content -->
		<main id="main"></main>
		<!-- #endregion -->

		<!-- #region Footer -->
		<hr />
		<footer></footer>
		<!-- #endregion -->
	</body>
</html>
```

This structure gives a very basic layout that all pages will conform to, it is boring but it works.

## The html

Due to legacy reasons, we need the first line adding a `<!DOCTYPE html>`. At least it is now short and doesn't need the weird shenanigans of yore. So yeah, we just add it and don't question.

Then of course, the `<html>` element itself with a `lang` tag to identify the language of the document. Not having this attribute is an [accessibility failure](https://www.w3.org/WAI/WCAG21/Understanding/language-of-page), besides, it gets added automatically by VSCode's html structure generation.

## The html head

Onwards to the `<head>` element we have just a few things, the first `<meta>` tag defining the character set should be the first thing after opening the head element as it ensures the page will be interpreted as UTF8 and not produce gibberish or corrupt or beautiful text.

The second `<meta>` tag however tells browsers to render correctly on mobile. This is the minimum value for it to work well and not cause issues. It can be tweaked further but that but most of the values are legacy and ignored by browsers.

More things will get added to the head for SEO, but that will be done later and is individual for each page.

## The body

Now comes the important part for our page, the `<body>` element and it's children. Here is where the actual page contents will live.

The first thing is a weird element with a dash in the name... Well, allow me to introduce web components!

### An aside to web components

The web has a really cool, albeit underused feature, of allowing for new HTML elements to be created by the page author. So basically we can change how the browser interprets the html on the page and add components, real life, live in the browser components! Not something that gets built and then spits out HTML, actual things!

<!-- TODO: insert mind blown gif -->

So, how those it work? Simple, you just have to write a tag where the name is composed of lowercase letters and dashes, and does not start with a dash[^1].

Those elements behave by default like a `<span>` tag, but we can style them as we like and use them as namespaces for other things and elements. So instead of having a billion of `<div>`s with random classes and making things unreadable, we can instead have the element be named for what it does! ✨ SEMANTICS ✨

There are more super powers to web components like the Shadow DOM, but that is for another time and I have a couple of blog posts that go into details about them.

Okay, back to the element...

### The SVG definitions

To load icons on the page, the best way is to use inline SVGs. They allow for the icons to follow the colour of the text, be styled independently, and run animations. In short, those are cool and have none of the drawbacks of using fonts for icons (that was a terrible idea, even when it was brand new).

But to make things more optimized and not repeating the whole SVG definition over and over again, a clever technique is to add an SVG "spritesheet", which means adding an SVG element to hold all of the icons and then referencing them, like this:

```html
<svg-defs>
	<svg>
		<defs>
			<symbol id="icon1">
				<!-- The icon parts -->
			</symbol>
		</defs>
	</svg>
</svg-defs>

<!-- Later in the code... -->
<svg>
	<use href="icon1" />
</svg>
```

Nice!

Now, this element comes first so when the HTML document is being streamed, the icon definitions will already be there instead of showing a blank spot until the definitions load.

### The page header

The layout is a very simple one with a header on top, the content in the middle, and a footer. So the `<header>` element represents everything that will be in the page header, including the top navigation bar, a mobile menu, and a hero image/video.

Below it is a lonely `<hr>` tag, that is just to add an extra visual separation between the sections, you will note the footer also has one before it.

More on all the items in the header in a future post.

### The main content

The `<main>` tag is where the most of the content of each page will live and where it will change the most as well. It has a somewhat redundant `id` of `main` for the skip link (more on that on the header post).

### The page footer

For now there is only a `<footer>` tag but here will be some content like the restaurant address, a button/link to book a table, and a mini site map. All of that will be covered in a future post.

[^1]: There is [a little bit more to that](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name), but in practical terms, a name that is letters only with dashes in between will work just fine.