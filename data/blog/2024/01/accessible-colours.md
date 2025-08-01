---
title: Making colours more accessible
createdAt: 2024-01-29T12:39:00.000-05:00
summary: Sharing a problem I got at work and how I solved it
image: ./assets/rainbow-eye.jpg
imageAlt: AI generated image of an eye with a radial gradient of a rainbow on it's iris
tags:
  - a11y
  - colors
  - design
  - CSS
  - BuildInTheOpen
  - BuildingInPublic
  - FrontendDevelopment
---

There was an interesting problem at work the other day. In short we have a dynamic list of things to display on the screen, all of them have a dotted border and colored text. Those colors are picked dynamically from a cycling list of colors. But _**not** all of them_ have enough contrast with the background and some are really hard to see.

How to fix that?

## WCAG to the rescue!

The [Web Content Accessibility Guidelines](https://www.w3.org/TR/WCAG22/), WCAG for short, say that:

> The visual presentation of [text](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html#dfn-text) and [images of text](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html#dfn-image-of-text) has a [contrast ratio](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html#dfn-contrast-ratio) of at least 4.5:1.

Here is the full reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

Basically it translates to: the contrast between the color used for text and borders has to have be of 4.1 against the background color.

## Engineering a solution

As I didn't want to manually check all colors and still wanted to pick between similar hues, I went out to gather a list of colors and check their contrasts. That was made possible thanks to [color.js](https://colorjs.io/) that provides some handy functions to calculate color contrast.

I used two criteria to check for the contrast:

1. WCAG 2.2 contrast algorithm.
2.  Accessible Perceptual Contrast Algorithm (APCA), the fancy new algorithm that will be used for WCAG 3.

With the list of colors in hand and a basic [`for...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) loop to iterate over them and calculate the contrasts, it was just a matter of picking the ones I liked most.

## Picking colours

To generate the final list of colours I used a simple HTML `<form>` element. Inside the form I ran the loop that generates contrasts and made it output the results to `<div>`s with checkboxes.

That gave me a representation of all the colours on the list in a nice selectable way. to make things even more explicit, the colour checkboxes that were not `checked` were styled to show only the hexadecimal code and [go to the end of the list](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Ordering_flex_items#the_order_property).

After that I set some pre-selection criteria to make my life easier: All colors with a contrast of at least 5 on WCAG and 50 on APCA were pre-selected, all others were not.

Here is the end result:

::codepen[Color contrast list checking]{#abMVLXm username=madcampos}
