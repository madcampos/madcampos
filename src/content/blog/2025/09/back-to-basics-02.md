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
First things first... As for this project there will not have any magic way to combine snippets of HTML into a full page and avoid repetition I would need to copy and paste a lot of code. Every HTML file is a full page, with all it needs to be ran by the browser. There is no magic templating engine or components here.

So as an strategy to keep myself sane and avoid editing the same things over and over again _(foreshadowing)_, I decided to work on the pages as kind of a [matryoshka doll](https://en.wikipedia.org/wiki/Matryoshka_doll) doing things in layers.

## The layout

From my previous "research"[^1] usually restaurant websites have a very similar and bland structure. It is familiar, so easy to understand and use.
The structure, from the top of the page to the bottom is:
1. Navigation menu
2. Hero image/video for the page
3. Big main content section
4. Footer with 3 parts
	1. Address information
	2. Reservation call to action
	3. Mini site map with all the site links

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

I will talk later about the weird `<svg-defs>` element, but for now this structure resembles the layout from the previous section.

Ah, yes, the comments with `#region` and `#endregion` are [markers for VSCode to create code folding _regions_ automatically](https://code.visualstudio.com/docs/editing/codebasics#_folding:~:text=Regions%20can%20also%20be%20defined%20by%20markers%20defined%20by%20each%20language.%20The%20following%20languages%20currently%20have%20markers%20defined%3A). Very neat and handy, specially with the code for the whole entire page in one file. It can grow fairly quickly, so having well defined regions to say "okay, hide this now" helps a lot navigating the code.

## The _very, very_ basics

If you already know about the basic HTML structure, like the `html`, `head`, and `body` elements, and what the heck a `DOCTYPE` is, feel free to skip this section.

### The `html` element

Due to legacy reasons, we need the first line:
```html
<!DOCTYPE html>
```

At least it is now short and doesn't need the [weird shenanigans of yore](https://www.w3.org/QA/2002/04/valid-dtd-list.html). So yeah, we just add it and don't question. Moving on...

Then of course, the `<html>` element itself with a `lang` tag to identify the language of the document. Not having this attribute is an [accessibility failure](https://www.w3.org/WAI/WCAG21/Understanding/language-of-page), besides, it gets added automatically by the [emmet shortcut in VSCode](https://code.visualstudio.com/docs/languages/emmet) for a basic HTML structure. Neat!

**#ProTip**:
> Learn and understand your tools kids, they will make you move fast in a correct way.
> 
> Different from vibe coding which will make you move fast but more like a drunken intern with no self-awareness, so very rarely will go in the right direction.

### The `head` element

Onwards to the `<head>` element we have just a few things, the first `<meta>` tag defining the character set.

It [**has to be**](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta#:~:text=%3Cmeta%3E%20elements%20which%20declare%20a%20character%20encoding%20must%20be%20located%20entirely%20within%20the%20first%201024%20bytes%20of%20the%20document.) the first thing after opening the head element as it ensures the page will be interpreted as UTF8 and not produce gibberish or corrupt our beautiful text. This will trigger the HTML parser to reinterpret what it already have as UTF8 and continue interpreting everything else as UTF8 as well, so having it as the first thing avoids errors.

**Side note**:
> This tag exists mostly for, say it with me: ✨ LEGACY REASONS ✨. In the times of yore, browsers would interpret your HTML using whatever character encoding the computer would use.
>
> For example: a computer in the Russia talking to a computer in Japan would only say gibberish because the two would not have the same character encoding.
>
> To solve this issue, the HTML specification before version 5 allowed the developer to specify the encoding used. On version 5 however everyone is required to use UTF8, improving compatibility and simplifying parsers.
> 
> A bonus to all of this: we can _mostly_ ignore entity encodings now. [^2]

The second `<meta>` tag however tells browsers to render correctly on mobile. This contents are the bare minimum value for it to work well and not cause issues:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

This tag is needed, again, for sort of legacy reasons. But not only... When the iPhone was new it was the first phone to ship with a full fledged browser[^3], before that phone browsers were very constrained and had to have pages built with very specific languages and tools for them.

The problem at the time was that regular HTML pages were made for desktop environments, so it meant a big CRT monitor, a mouse, and a keyboard, not a tiny LCD screen with touch.

To solve this disconnect between the iPhone and desktop pages, Safari on iOS introduced this meta tag. It told the browser to render the page in a "mobile first" way. The Android and Windows Phone browsers adopted the tag and that's why we have it today.

**Fun fact**:
> If you select the "view in desktop mode" option in your phone's browser, that is sorta "disabling" that tag.

**Fun-er fact**:
> You can do a couple more things with this tag. Most of the options today are ignored by browsers but the ones still supported can do some [quite interesting things](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport#interactive-widget).

Last thing on the `<head>` is the `<title>` tag. This is the text that shows on the browser tab. That's it. 🤷‍♂️

**Fun fact**:
> Browsers are really helpful and try to interpret your page the best they can, like, they are 10/10 GOAT no cap.
> 
> That means they will really, I mean _really_ put in the effort to interpret your broken HTML. One of the very cool ways to do it is to magically add the `<head>` and `<body>` tags for you if they are missing.
> 
> They do it by looking for the `<title>` tag, so if you write a page like:
> ```html
> <title>This is awful</title>
> <p>But works!</p>
> ```
> 
> The browser will correctly interpret that, everything before the `<title>` will be added to the auto-generated `<head>`, and everything after will be added to the auto generated `<body>`.
> 
> Neat!

As a final note for this section: for now those are the only things added to the `<head>`. Another time we will revisit the information here to add things for SEO, social media previews and more metadata. But this is enough for now to make the website work nicely on both desktop and mobile.

## The `<body>`

Now comes the important part for our page, the `<body>` element and it's children. Here is where the actual page contents will live.

The first thing is a weird element with a dash in the name... Well, allow me to introduce web components!

### An aside to web components

The web has a really cool, albeit underused feature, of allowing for new HTML elements to be created by the page author. So basically we can change how the browser interprets the html on the page and add components, real life, live in the browser components! Not something that gets built and then spits out HTML, actual things!

<!-- TODO: insert mind blown gif -->

So, how those it work? Simple, you just have to write a tag where the name is composed of lowercase letters and dashes, and does not start with a dash[^3].

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

[^1]: Again, by "research" I mean googling "Italian restaurant website template" and seeing what people are doing.

[^2]: The absolutely strictly necessary entity encoding needed is `&lt;` to encode `<` and avoid opening tags, but, just for better compatibility and avoiding issues you should also encode: `&amp;`, `&gt;`, and `&quot;`. Which respectively translate to: `&`, `>`, and `"`. Those will avoid 99% of the issues with weird characters in html. For the rest just use straight up unicode and you will be good.

[^3]: _Technically_, other browsers that rendered HTML already existed in mobile phones. But those were more like "specialized" apps, than the "general" type of browser for desktops and the ones we have today. The iPhone innovation on that space was using the same technology stack as the desktop counterpart. So you could, in theory, for the first time write things only once and they would work in multiple very different devices. In reality things were more interesting, but that is a story for another time and maybe two shots of tequila.

[^3]: There is [a little bit more to that](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name), but in practical terms, a name that is letters only with dashes in between will work just fine.