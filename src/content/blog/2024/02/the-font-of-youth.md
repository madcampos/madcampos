---
title: The font of youth
summary: Quick tutorial on shrinking font sizes for variable fonts.
createdAt: 2024-02-16T18:20:18.915-05:00
image: ./assets/fountain-of-youth.jpg
imageAlt: A close up shot of a goblet filled with gems and typewriter keys floating on a thick ink on the colours cyan, yellow, and magenta. On the background and out of focus are the mechanical parts of a typewriter.
tags:
  - CSS
  - Fonts
  - Typography
  - BuildingInPublic
  - BuildInTheOpen
  - design
  - FrontendDevelopment
---

One of the ways to keep a website _fresh_ and _new_ is to have custom _fonts_!

Putting aside all the bad puns related to typography and the fountain of youth, let's talk about optimizing your fonts!

## What a time to be alive!

Typography has never been so easy and fun, we have an influx of high quality, free and feature full fonts. Those range from [color](https://caniuse.com/colr-v1) to [variables](https://caniuse.com/variable-fonts) with every [emoji](https://en.wikipedia.org/wiki/Emoji) and [Unicode code point](https://en.wikipedia.org/wiki/Code_point) in between!

## Variations on a theme

From those, the better supported and most interesting are _variable fonts_. They provide us the means to have one single file that defines how to draw characters on the screen but also include variations to those. Like, how to draw everything from <span style="font-weight: 100;">regular and thin</span> to <span style="font-weight: 800;">bold and thick</span> text.

The problem is most web font generator kits online are a little bit old and don't support those new features. Some of them don't even support the much smaller and newer [`woff2`](https://caniuse.com/woff2) format, even though all browsers support it for quite a while.

## Not quite the Rosetta Stone

Even with the file size reduction of having a single file instead of two or more, there is still the problem of _subsetting_.

What happens is usually fonts come with lots of characters. Having all of them is extremely handy for an operating system but may not be so useful for a personal website written in English...

I can probably even get rid of the letter ["q"](https://en.wikipedia.org/wiki/Letter_frequency) if I want to! Well, not anymore as I just used the letter... 🤦‍♂️

The point is: the chances that I need another character that is not in English are so slim, that is not worth to ship 300kb more for something that is not gonna be used anyways.

And even if it is, I can always resort to my `font-family` stack declaration and fallback to the operating system font that will almost certainly support that character. It may not look pretty, but there is no information loss and that comes over _æstethics_.

To sole the problem we _subset_ the font and keep only the characters we want.

## Down the snake pit

Besides not supporting `woff2`, all the tools that I found that do support it, fail to handle variable fonts. So I had to do something that I simply despise: install _new things_ to solve a _single problem_, a _single time_...

I found the tutorial [<cite>How to subset a variable font</cite>](https://clagnut.com/blog/2418/), by Richard Rutter. It uses a Python tool to subset the font.

As almost everything there works, I won't repeat it here, go read the tutorial and give the person some views!

There is only a _caveat_ to the tutorial: it fails when using single dashes for the commands.

So instead of doing:

```shell
pyftsubset LiterataTT.ttf
    -unicodes="U+0020-007F, U+00A0-00FF, U+0100-017F, U+2000-206F, U+2070-209F, U+20A0-20CF, U+2100-214F, U+2200-22FF, U+FB00-FB4F"
    -layout-features='*'
    -flavor="woff2"
    -output-file="LiterataTT.woff2"
```

You should do:

```shell
pyftsubset LiterataTT.ttf
    --unicodes="U+0020-007F, U+00A0-00FF, U+0100-017F, U+2000-206F, U+2070-209F, U+20A0-20CF, U+2100-214F, U+2200-22FF, U+FB00-FB4F"
    --layout-features='*'
    --flavor="woff2"
    --output-file="LiterataTT.woff2"
```

Note that every parameter passed have a `--` instead of a `-` in the beginning of it. With that change, everything works flawlessly!

## The fit test

Then there is the problem: how do I test if the new font works?

For that I've used [FontDrop!](https://fontdrop.info/), a neat tool to view properties of a font and test it out. If your font has variable axes you should see them like on the screenshot below:

![A screenshot of part of the UI for FontDrop showing multiple switches for the open type features of a font and two axes showing the weight and optical variations for the same font.](./assets/font-axes.png)

## Emperor's new clothes

Now that the font works, we add it to our site CSS using the following snippet:

```css
@font-face {
	font-style: normal;
	font-weight: 100 900;
	src: url('<FONT PATH>') format('woff2-variations');
	font-family: '<FONT NAME>';
	font-display: swap;
	font-variant-alternates: styleset('ss01') styleset('ss02') styleset('ss03') styleset('ss19') styleset('ss20');
	font-variant-ligatures: common-ligatures contextual;
}

:root { --sans-serif-font-family: '<FONT NAME>', 'Arial', system-ui, sans-serif; }
```

You can read more about the the `@font-face` rule at the [MDN documentation for it](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face).

That's it, now we are loading about 260kb _less_ on users' devices!
