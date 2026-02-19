---
title: Static Site Generator Wishlist
summary: Things that I wish a static site generator did, or how it was organized.
createdAt: 2026-02-17T18:46:40
draft: true
tags:
  - astro
  - meta
  - web
---
So, I like Astro, but it doesn't quite do things the way I think would be best... this is my take on how or what features a static site generator should have.
Here is the list:
1. Standards based as much as possible
2. String interpolation instead of weird syntaxes
3. Config based instead of file based routing
4. Minification by default, bundling is opt-in
5. Progressive adoption

# Standards based

The code should be based in standards, as in: html, css, and js as much as possible, without introducing newer syntax and ways of doing things that are incompatible with the web.
This helps keeping things lean and interoperable, simple as that.

## String interpolation

Yeah, JSX seems cool, but I much prefer the approach that [lit](https://lit.dev) uses, it is based on a standard and just works. For a static builder that has to output strings, doing string interpolation is more than enough and is faster than parsing and transforming the code.
Plus providing colorization to the code should be separate from the actual functionality of the tool, it should be part of the editor, not completely tied to the build tool.

Ideally, such string interpolation would handle a couple of things to make life easier, like converting `null` and `undefined` to empty strings and joining the items of an array.

Basically:
1. If the value it is `null` or `undefined`, return an empty string.
2. If the value can be converted to a string, do so.
3. Iterate over arrays and resolve as the previous points, then join the array.

Anything on top, like lit's validation of element attributes is extra and a nice to have, but not necessary.

## Config based

File based routes seem nice at first, but then you have situations where the code is repeated or very similar to other pages so you have to repeat yourself.

The other point is it ends up adding extra syntax. There is no "standard" way of providing code to be processed on the server side and separate that from the client side code. Astro does it in a really weird way with the "`---`" blocks.

One potential approach would be to use a syntax similar to Vue and have a `<script>` block, along with a `<template>` block. But then it breaks the string interpolation part and you end up having to parse and handle the "html".

So the solution here is have a central entrypoint providing all of the routes for the application, and those just being function  calls.

One thing that file based builders have that is really useful is a separation from the actual page code function and the function that generates parameters to pass to the page. Like, the route have some parameters, and those are resolved separately.
This makes it easy to have parametrized routes while also providing early error detection for the routes.


## Minification by default, bundling is opt-in

Yeah, this is a hot take: I think we should stop overbundling our code. An even hotter take is to ship less js!

What I mean here is that, as developers, we know better about the reusable parts of our code than any tool, this means that we already know which parts can be easily shared and be kept in bundles.

Libraries and everything inside `node_modules` would be bundled by default, as those dependencies are outside of our control and rarely change. Yes, we can apply tree shaking and all the goodies, but keep separate dependencies as separate files, unless explicitly set to combine bundles.

For patterns like an `index.ts/js` file that only `export`s other things, or is used only to _compose_ `import`s, we should have a way to explicitly say that file should be bundled, so all of it's `import`s will be nicely combined into one file.

This gives power to developers while still simplifying the bundler code. But aside from that, code should always be minified, no exceptions.

## Progressive adoption

Want to render markdown? Use a plugin for that. Want to integrate with content collections or some sort of "local database", use a plugin for that.

Compose from a set of tools rather than force to bring everything and the kitchen sink upfront. But also, provide an approved set of tools and avoid the "unopinionated" trap.

## Conclusion

That's it. I think other things like live reloading and hot module replacement are very cool, but also an extra. The basics should work in a simpler way to begin with, we should avoid piles of abstraction and take ownership of the code we write.