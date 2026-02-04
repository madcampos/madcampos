---
title: "Hello, World!"
createdAt: 2023-05-05T01:59:12.000-04:00
updatedAt: 2026-02-04T15:18:34.000-05:00
updates:
  - date: 2023-06-05T18:48:45.000-04:00
    changes: Formatted post after proof reading.
  - date: 2024-02-02T03:21:00.000-05:00
    changes: Added an image to the post.
  - date: 2026-02-04T15:18:34.000-05:00
    changes: Fixed Github URL.
summary: Summary of the experience and hurdles of coding this blog.
image: ./assets/new-waters.jpg
imageAlt: "A painting of a boat bursting bow first from the waves with a rainbow on the background."
tags:
  - BuildInTheOpen
  - BuildingInPublic
  - meta
  - coding
  - vite
  - TS
relatedPosts:
  - blog-structure
  - going-astro
---

This is how I built this blog, or at least the first iteration of it. So please ride along on this journey of sweet success and sorrowful cryptic error messages.
But first let me vent out on my frustrations on modern front-end tooling...

## #rant

I know that Vite is amazing. It helps in getting a nice and optimized project all the way and having a "no build" development environment is really refreshing and is lovely to work on. _However_, I still hate that I’m required to have a build step when generating my files. That _is_ a good idea for big projects full of small files and libraries but I’d still like to have the option to opt out of bundling just to have a website that is readable _by people_ and a good place to learn even though it is not as optimal. I hate to be locked in and have to go out of my way to deal with [Rollup](https://rollupjs.org/) (or [Webpack](https://webpack.js.org/)) shenanigans instead of just compiling typescript and be done with it.

Okay, #rant over, back to the post.

## The Why

I was talking to a friend about building in the open and decided it would be a good idea to show my skills and thought process. But first I had to decide how to get the content out and where to put it.
One idea was to use a hosting service like [dev.to](https://dev.to/) or [WordPress](https://wordpress.org/) and hook my website to it, but I already have a static site and like to keep things as simple for people accessing it as it can be.

So, that meant:

1. Use the existing infrastructure
2. No front-end frameworks (to keep things simple, it has static data only after all)
3. Has to integrate well with Vite
4. I can build it myself if no tools already exist

## The How

My investigation began, as usual, with typing "Vite blog plugin" on Bing and Google and seeing what that lead me.
Unfortunately there were no existing plugins for that. The only option was [VitePress](https://vitepress.dev/), it is a good one but when I tried it was doing too much magic and altering the existing project a lot, so not a "plugin" and more of a "full featured system built _on top of_ Vite".

That meant I was about to build a plugin or at least write _some_ code myself.

The investigation followed with some Multi-page application (MPA) plugins for Vite. As it was born from the Vue community it's main purpose is to build Single-page applications (SPA) and it's not the best at building MPAs, but it can be done. The one that caught my attention was [`vite-plugin-virtual-mpa`](https://github.com/emosheeep/vite-plugin-virtual-mpa/). I configured it, wrote a lot of code and then went to test...

BOOM! Cryptic errors showed up.

## The Errors

The error was:

```
RollupError: The "fileName" or "name" properties of emitted files must be strings that are neither absolute nor relative paths, received <PATH_TO_FILE>
```

I tried to investigate what was causing it, and to keep a 4 hours of frustration story short, vite uses rollup internally and to build a MPA we have to pass in the `input` configuration to it so it can find the files and build them.

The plugin was generating the files on the dev server but when it came time to build, rollup was not able to find them because they were never created _on disk_, they were only _virtual_.

## The (Failed) Attempt

I then dug into the source code for `vite-plugin-virtual-mpa` and tried to create the minimal steps to reproduce the bug.

The trial and error approach didn't help as the problem was too entrenched in the plugin's code and I was not able to find a way to fix it.

But after taking a step back it clicked to me:

> What if I created the files and the input configuration "by hand" and injected it on the `src` folder then let vite deal with the build part?

## The Solution

This time I tried the minimal approach first to find bugs and was able to build a working version in a couple of hours. Much of the logic was reused from the plugin fix attempt, I just had to literally write the files on disc and find a way to structure the logic.

So, the "plugin" does the following steps:

1. Walk the `blog` folder and find all the `.md` files
2. Extract the metadata from the files
   1. The folder name is the date
      (e.g. `blog/2023-05-05/hello-world.md` is from May 5th, 2023)
   2. The file name is the slug
      (e.g. `blog/2023-05-05/hello-world.md` is `hello-world`)
   3. The first header on the file is the title
      ```markdown
      # Hello, World!
      ```
   4. The first HTML comment is the metadata with some fields like `description` and `tags`
      ```html
      <!-- description: Summary of the experience and hurdles of coding this blog. -->
      ```
3. Create a file structure on the `src` folder with templates for each page and the extracted metadata
4. Export a list of files to be injected by Vite and Rollup
5. Let vite do it's ✨ magic ✨
6. Profit

## The Result

The result is this blog that you, dear reader, is reading right now. It is not perfect, but it is a good MVP to be up and running and improve as I go.

The code can be viewed on GitHub on the [`blog/index.ts`](https://github.com/madcampos/madcampos/blob/9f3ada31848ab387e2d4ac3faa53f02779e13eff/build/blog/index.ts) file.

## Next Steps

There are still some point to improve. The next ones I intend to tackle are the styling of the blog (it is pretty barebones right now), and pagination.
But those are for future posts.
