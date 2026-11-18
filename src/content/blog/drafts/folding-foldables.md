---
title: Folding Foldables
summary: Or how I added support for some foldable phone features to this website.
image:
imageAlt:
createdAt: 2026-11-13T11:46:24.674-05:00
draft: true
tags:
---
As much as I hate how Apple is called "innovative" even though the features they implement are usually around for a few years, they do know how to make some hype.

A foldable iPhone is not different. When it first launched I was wondering if they would support the web APIs for foldables. And they [indeed are supporting them](https://webkit.org/blog/18486/webkit-features-for-safari-27-1/).

## Viewport Segments API

The main API to pay attention here is this, it provides a way in CSS (and in JS as well if you like) to get the number of screen segments and where they are phisicaly.

This [image from MDN](https://developer.mozilla.org/en-US/docs/Web/API/Viewport_segments_API/Using) is very illustrative:

![Representation of a foldable phone using rectangles, both in landscape and in portrait mode. The landscape one on the left has the numbers "0 0" and "1 0" on the rectangles, respectively; And the portrait one has the numbers "0 0" and "0 1" on the rectangles, respectively.](./assets/viewport-segments.png)

It shows how a phone would be represented, using rectangles. The segments are laid out on a grid. And from the description on MDN it is intuitive to understand how they work:

> - In a horizontal side-by-side layout, the left segment is represented by `0 0`, and the right segment is represented by `1 0`.
> - In a vertical top to bottom layout, the top segment is represented by `0 0`, and the bottom segment is represented by `0 1`.

## The implementation

A little bit of a bummer, I've implemented this only on the [home page](/).
The content there is already using a grid[^1], so making the grid conform to the foldable sides was easy enough, and luckily Chrome dev tools have a way to test foldable devices.

<!-- TODO: insert screenshot of dev tools in landscape mode here -->

Okay, but how does it _work_, what is the _logic behind it_?

On a large enough screen on landscape mode, the home page shows my pretty face on the left, and some text on the right, I wanted to keep this layout but make them split on the fold. That was the easy part.

On portrait though it was a little bit more interesting. The fold splits the screen into a top and a bottom part.
This creates a more interesting situation as the layout has to scroll anyways and it would be quite silly to limit scrolling to on half of the screen.

So for the portrait mode, only the _initial_ layout adheres to the fold and puts the logo and avatar on the top half, followed by the rest of the page below.

<!-- TODO: insert screenshot of dev tools in portrait mode here -->

## Shortcomings

One of the things that still eludes me is why the heck when the phone is flat open I can't use the viewport segments?!

I mean, it is named _continuous_ for a reason. Still it should expose the viewport segments anyways.

[^1]: Technically it was a flexbox before, so I had to update that as well...
