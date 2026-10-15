---
title: Do I need _all_ of that?
summary: My thoughts on build systems, tooling, and "dependency fatigue".
image: ./assets/carles-rabada-05ci_hxKWr4-unsplash.jpg
imageAlt: Multiple stacks of books both on the background and on the foreground, making for a busy and cluttered photo.
createdAt: 2026-10-09T11:44:07.458-04:00
draft: true
tags:
  - Tooling
  - Astro
  - Coding
imageRights: Photo by [Carles Rabada](https://unsplash.com/@carlesrgm) on [Unsplash](https://unsplash.com/photos/assorted-file-book-lot-inside-the-room-05ci_hxKWr4)
---
I'm tired of those bazillion notifications about security on GitHub that are beyond my control or don't even apply to my project.

I'm tired of a long list of dependencies that don't contribute much and just add to my maintenance burden.

I want to ["use the platform"](https://nolanlawson.com/2026/10/03/why-dont-more-developers-use-the-platform/) as much as I can.

## Rant over, what now?

That brings me to a discomfort I have felt for a while now with how complex build systems and tooling have become.

On one side, yes, I do understand the need to achieve high performance in a _commercial_ application, that will be used by lots of people.
But for a niche side project, one that is exactly 1 (one) html page with a few JS and CSS files here and there... Why do I need to bring ["everything and the kitchen sink"](https://stackoverflow.com/questions/33779296/what-is-exact-meaning-of-kitchen-sink-in-programming)?!

### Astro

Astro is cool, this website is built using it. Although I like some ideas from it and the general organization on separating pages, content, and components. It is still too much, like, _way too much_.

And the whole thing with file based routing is cool for some things, but can be a burden for others. But I digress...

### Vite

One option I find somewhat comfortable is Vite, it offers a great DX for running a dev server and is quite powerful, functioning as both the dev server and the build tools. Astro is built on top of it.

The dev server is useful and fast... But that is still _too much_.

Yes, having a build tool in one place is handy, but why does it has to do some magic bundling by default? Why can't I control it, or opt-out entirely?

## I'm tired I guess

I think I'm just tired, fatigued with so much cognitive load from something other than my application.

I guess I yearn for a simpler time in the sense that we didn't need much to host a local server and get going.

## A wishlist of sorts

I think my ideal scenario is:
- **A "server" that I can add routes**: File based routing works somewhat great but does things weirdly with the mix of markup and logic.
- **Live reload for the dev server**: It is not the end of the world, but having it is just handy.
- **A _minification_ process**: No, I don't want bundling, performance is not an enormous issue and readability is still paramount. It is for small/side projects after all.
- **Less dependencies**: Ideally one stable thing, or a couple stable things.
- **Unobtrusive and having escape hatches**: I should be able to ignore some things, turn them off, or just replace parts of the process with ease, so if I need other tools, then I can add those tools later.
- **Build steps**: Bringing back the idea of build scripts or steps instead of trying to cram everything in a single tool.