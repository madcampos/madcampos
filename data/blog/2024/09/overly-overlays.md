---
title: Over-engineering Accessibility with Overlays
summary: Why Accessibility Overlays are a bad solution to a non problem, and what the problem really is.
createdAt: 2024-09-13T18:57:15
tags:
  - a11y
  - Accessibility
  - WebDevelopment
  - web
  - rant
image: ./assets/rose-colored-glasses.jpg
imageAlt: A close shot of a smiling man, he is wearing opaque rose colored glasses with the universal accessibility icon overlaid on each lens
---

If you don't know what an Accessibility overlay is here is a quick description from [Overlay Fact Sheet](https://overlayfactsheet.com/en/) :

> Overlays are a broad term for technologies that aim to improve the accessibility of a website. They apply third-party source code (typically JavaScript) to make improvements to the front-end code of the website.

Basically they are a piece of code stamped on top that promises to make a website accessible. The problem is: in the best cases they don't do much, in the worst they actually hurt accessibility.

![A version of the "Flex Tape meme". Composed of two panels: On the top panel, a guy is about to slap a piece of tape to hole on a leaking water tank. Overlaid on him it reads: "Promises from overlay vendors"; Overlaid on the water tank it reads: "Your inaccessible website". The bottom panel is a close up of the guy's hand sealing the hole on the tank with a piece of tape. Overlaying his hand it reads: "accessibility overlay".](./assets/overlays.jpg)

## What do the accessible overlays do?

They add some tools to website, but the interesting thing is most of them are achieved easily and more robustly by other means.

I'll go through the list of features from an example[^1] overlay product, then breakdown every feature, what it does, and their built-in alternative.

## The list of features

- Bigger text
- Bigger cursor
- Tooltips
- Line height
- Hide images
- Readable fonts
- Dyslexic font
- Stop animations
- Invert colors
- Grayscale
- Brightness
- Contrast
- Saturation
- Highlight links
- Reading line
- Reading mask
- Page structure

## Breakdown of features

### Bigger text

This is an option with 3 levels to make text bigger. I guess you could call them LG, XL, and XXL.

This is the first "what the heck?!" moment as browsers do provide zoom features already, in fact, they provide a couple ways to change how big or small a text is... Why do you need it in a way that is redundant, flaky, and reduces user freedom?

To list the alternatives, here they are:

- Browsers provide page zoom, you can make everything, not only text big or small
- Browsers provide means to control how large the overall base font size is
- Operating systems provide ways to control how large the overall base font size is
- Operating systems provide ways to control the scale and resolution of the whole thing

So, I'm sorry, but adding more code to do a thing that the browser _and_ operating system already provide is pointless.

To make matters worse, the overlay can and will probably miss some text where the actual thing that is responsible for displaying that text on the screen will not.

### Bigger cursor

The operating system already provides the means to do this, on Windows for example you can either use the old cursor settings and set from a couple fixed sizes, and starting with Windows 10, on the accessibility settings have finer control for the size.

You can also make the cursor more obvious and change it's color in both Windows and Mac OS, so I can have my nice and orange cursor and it Just Works ™!

To make things even worse, changing a cursor breaks the affordance of links, text boxes and other controls because it will simply plaster one single big cursor over everything, indiscriminate if it is a link, a text box, or whatever other type of cursor you need for something.

So why would I make my life harder by giving up freedom to a tool that restricts and frustrates my experience?

Why should I, as a website and brand owner, impose such a bad thing to my _customers_?

### Tooltips

This one is _(foreshadowing)_ tricky and confusing... It will show tooltips for images, but only for those that already provide an _alternative text_.

It is _allegedly_ meant to be compliant with the [Web Accessibility Guidelines (WCAG), version 2.1, succession criteria 2.5.3](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html). Which states:

> For [user interface components](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html#dfn-user-interface-component) with [labels](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html#dfn-label) that include [text](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html#dfn-text) or [images of text](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html#dfn-image-of-text), the [name](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html#dfn-name) contains the text that is presented visually.

Translating from the jargon of "standard speech" that means that when you have things to interact with like buttons or text boxes, those should have labels to identify them.

Moreover, those labels should contain information saying what they relate to, for example a button only saying "buy" doesn't help users to understand what you are tying to buy.

How does that relate to images? It doesn't. The foreshadowing was about this. Not trying to be too mean here, but how to trust someone to fix my problem if they fix the wrong thing?

What they were probably trying to go for is actually [WCAG 2.1 success criteria 1.1.1](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content), which states:

> All [non-text content](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content#dfn-non-text-content) that is presented to the user has a [text alternative](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content#dfn-text-alternative) that serves the equivalent purpose.

That means images should have an alternative text to describe them. So people who can't see the images will understand what they are about.

More foreshadowing: those alternative texts are read by screen reader users when they navigate through the page already. So, why would someone who can't see need a tooltip?

Also, if the information is important, why not just present it as text alongside the image already?

### Line height

This is an actually good one, it is something you cannot easily control on _most_ websites.

One possible alternative for text heavy websites like a blog, or newspaper is using the browser's "reading mode". That gives users control on how the text is laid out, but it doesn't work well for other types of content like social media or shopping websites.

Another option would be to use browser extensions that change the page style, that will give you even more control to apply global styles to basically everything. 🤷‍♂️

### Hide images

It's supposed function is to increase legibility for users. In the first place: **YOU SHOULDN'T BE PUTTING TEXT ON TOP OF IMAGES WITH POOR CONTRAST!**

With that out of the way, this is an interesting feature to have, but also achieved by the operating system. Specifically, there is the forced color mode on Windows that does just that. It removes images and reduces colors to a very limited palette to improve accessibility. And the best part: it is customizable!

So yeah, another tool with not so clear use case and a proper built-in alternative. Moving on...

### Readable font and Dyslexic font

A totally biased opinion here: both font choices (Helvetica and Open Dyslexic) are hideous!

But again, this is a thing that browsers do provide for you: on the browser settings you can choose what font to use to display text, and you can even force it to use whatever font you like ignoring any styles applied to the page.

It will override even the overlay changes, so why?!

### Stop animations

This is cool, but should be the default. Your website should start with animations off and that be added on top.

But then again, browsers and operating systems provide a "reduced motion" option, you as a site owner should _just_ respect that and act accordingly.

### Inverted colors and grayscale

So... repeat after me: the operating system already provides that.

It is a recent thing for Windows, but the ability to apply color filters on the screen has been there for ages on Mac OS. It is interesting that there are also options for people who are colorblind, so even more powerful than the overlay.

### Brightness, contrast, and saturation

This reminds me of my old CRT monitor, it had all of those options, they were really nice clicky buttons that made a happy "click" when you adjusted those settings. I guess that people don't have buttons on modern monitors, like the newer iPhones.

Oh well, another case of adjustable in the operating systems settings. You can also adjust on the actual physical hardware. Even on a phone those things are usually adjustable.

### Highlight links

First of all, you shouldn't be making your links hard to find, that is not only very sadistic, it is also a potential for lawsuits as it breaks WCAG guidelines and most countries have accessibility laws that are very similar to those guidelines.

Then again, there are browser settings to always underline links, operating system settings, and forced colors mode that do that as well.

### Reading line and reading mask

Those are very cool features that are actually useful. Albeit not customizable.

The reading line adds, well, a line, that follows your cursor and is drawn on the entire screen, so people can use it to read content on your page.

The reading mask dims out part of the screen to focus on a block that follows your mouse.

A potential alternative, again, for text heavy websites, is using the reading mode of your browser, they provide similar features with more control.

### Page structure

This is just pointless.

Yes, it will show a nice little table of contents of your page, but it the HTML is not semantic and not properly organized already, the page structure will be a mess.

Also, screen readers already provide this list to users anyways, this is in fact the _fundamental_ way that people use screen readers!

\[cue the audience to gasp with the shock of discovery that people do things in different ways\]

## Conclusion

With the exception of line height, reading line, and reading mask, all the other features have equivalents offered by either the browser, the operating system, or both.

Yes it is nice to offer users easy ways to access features, but they are already used and probably using some of those, so it doesn't make sense.

For example, a blind person will not use a computer by randomly clicking on the mouse and hoping for the best and only turn the screen reader when they accidentally reach your precious little website.

A dyslexic person will already have everything in Comic Sans, they won't stop and think: "Oh my, I reached this website that has an accessibility overlay, why don't I go and change the font to make it worse than I'm used to just to make the website owners happy for offering a subpar experience?"

Those people are already adapted and using the tools they need, when you introduce a random thing that changes something that is already well established to make you feel good (and not get sued) it is bad for them, and guess what: you still can get sued.

Adding an overlay and just pretend to be accessible while not solving the _fundamental_ problems of page structure or content. You need to have something in order to make it work. If your page is not good the overlay will not do magic for you.

[^1]: I'm not citing the specific company for legal reasons, I don't want to get sued by them.
