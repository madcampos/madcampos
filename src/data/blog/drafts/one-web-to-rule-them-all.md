---
title: One web to rule them all
createdAt: 2024-02-11
image: ./assets/weird-people.jpg
imageAlt: Alt text for the article image
summary: Ramblings on the web as a platform and how to write defensive and accessible code for it.
draft: true
tags:
  - a11y
  - web
  - html
  - FrontendDevelopment
---

The web is accessible by default, we just screw it... over... and over... and over...

## The accessible side of life

When we think about writing code for pages or web apps, it is important to think about it from a _semantic_ perspective. For example, what parts your app have? What are the names of things?

For me the best way to start is by sketching an app idea with rectangles and arrows to show how things are presented in a general sense and how they connect.

(add picture of my notebook with an app sketch)

This gives an outline of what things are and also the first landmarks of our content. Which in turn translate to an html elements.

## Turning ideas into code

The interesting thing for me is even without any style you can have a great architecture, because the information is all there. You don't need any CSS to find out that the title of a blog post should come _before_ the post text. That is structure, and that is _HTML_'s job!

The problem I see with how things are done today is that people in the name of "speed" give up architecture completely for an amorphous soup of unintelligible tags with a thin facade of "components".

It gets even worse because when you create something like a `<button>` it has lots of intrinsic things associated to it, take a look at the needs for a button here: https://www.w3.org/WAI/ARIA/apg/patterns/button/.

So, no, using a `<div>` and _pretending_ it is a button doesn't work, you can recreate all the interactions yourself, use a half-baked library to do that or simply **USE A FREAKING `<button>`!**
