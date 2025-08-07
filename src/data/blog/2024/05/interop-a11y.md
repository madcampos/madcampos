---
title: Web standards make us more accessible
summary: Quick note on Interop, the browser initiative for interoperability and how it focus on accessibility in 2024
createdAt: 2024-05-29T00:09:34
tags:
  - a11y
  - FrontendDevelopment
  - OpenWeb
  - WebDevelopment
  - Interop
  - Accessibility
image: ./assets/atlas.jpg
imageAlt: An AI generated image of a marble statue of a man, sitting on a wheelchair leaning forward, he has his arms at his back, holding a stained glass globe.
---

> This is a post for National AccessAbility Week and a late post for Global Accessibility Awareness Day (GAAD).

For a few years now, browser vendors gather together for something called "Interop". This is a joint effort to make the web more _interoperable_, making things behave the same and in a predictable manner. Here is the link for Interop 2024: https://wpt.fyi/interop-2024.

## The good parts

One of the things that I like most about Interop is that they don't look only to the shiny new features. There is also effort to make existing and legacy features work in the same way across browsers.

That effort includes revisiting things like forms, text encoding, and mouse event — all things that we take for granted but _used to have_ very slight differences between browsers.

## The star of the show

One of the focus areas in 2024 is _accessibility_!

It includes:

- Roles and announcing them consistently and correctly
- SVG content[^1]
- Forms[^2]
- More forms[^3]
- _Even more_ forms[^4]

## Why does it matter?

Standards give us common benchmark for how things _must work_. Having robust standards, with sensible and accessible defaults makes developers lives easier, while improving the user experience for everyone.

## We are getting there!

I'm excited to read the support across the board be of [90% and improving](https://wpt.fyi/interop-2024)!

![A screenshot of the Interop Dashboard for 2024, containing the header and first line of a table. The header is, from left to right: "Active Focus Areas"; Then four icons for Chrome, Edge, Firefox, and Safari; Then the word "Interop". The first line reads: "Accessibility"; 95.3% for Chrome; 94.4% for Edge; 96.7% for Firefox; 92.8% for Safari; 90.2% for Interop.](./assets/interop-a11y.png)

## What does that mean for me?

As a developer it means not having to worry that some browser and screen reader combination does a weird thing, it makes testing easier and less time consuming, also makes me feel confident that I'm delivering a product that is accessible and doesn't exclude people.

We should all be writing our code in an accessible way, it _helps everyone_! Including _you_ when you don't have your glasses on, or when you are cooking and have greasy hands. It is similar to elevators being essential for wheelchair users but still useful for people carrying luggage or pushing a stroller.

And to close this post, here is a #protip use accessible patterns when developing complex interactions: https://www.w3.org/WAI/ARIA/apg/patterns/

[^1]: How to write alt text for SVGs: https://www.deque.com/blog/creating-accessible-svgs/

[^2]: Kudos to this wonderful talk by Rachel DiTullio: https://racheleditullio.com/talks/accessible-forms/

[^3]: Post on form errors: https://adrianroselli.com/2023/04/exposing-field-errors.html

[^4]: Post on the search element: https://www.scottohara.me/blog/2023/03/24/search-element.html
