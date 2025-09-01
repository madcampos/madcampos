---
title: Going astro 🚀
createdAt: 2024-01-14T11:45:00.000-05:00
updatedAt: 2024-03-24T10:46:00.000-05:00
updates:
  - date: 2024-03-24T10:46:00.000-05:00
    changes: Added a conclusion to the RSS image size validation and how it was propperly fixed.
summary: A tale of how I went from a vite site to an astro site and the hurdles along the way.
image: ./assets/astro-corgi.jpg
imageAlt: AI generated image of a corgi on a red rocket costume flying through space with planets and rainbows on the background.
tags:
  - BuildInTheOpen
  - BuildingInPublic
  - meta
  - coding
  - astro
  - vite
  - 11ty
relatedPosts:
  - hello-world
  - blog-structure
  - pagespeed-score-bragging
---

So, I migrated my blog and website to [Astro](https://astro.build)...

![Gif of a man on a costume of a rocket. He walks around like he is flying on the rocket](./assets/rocket.gif)

Here is _why_.

## Vite is nice, tooling is _not_

Vite is really good to write single page apps and the kings of applications that run mostly on the client. It has some friction when it comes to static generated websites like blogs.

This site, and blog, is mostly static and can be generated based on data and a set of templates.

My first attempt was to write the tooling myself to see how that worked (you can read about it on the posts ["Hello, World!"](/blog/2023/05/hello-world/) and ["The Semantics of Blogging"](/blog/2023/06/blog-structure/)), but that proved to be more difficult than expected.

In short, I had to write a lot of code to tell [parcel](https://parceljs.org/), the bundler that Vite uses underneath to tell it what files to process. It got compounded because this was a hacky way to do things. I should have wrapped the code into a Vite plugin and not a process to run before vite does it's thing.

Well, it could be worse... I could have to configure [webpack](https://webpack.js.org/) from scratch; and _that_ requires a PhD in _rocket science_ (#foreshadowing).

## Moving from Vite

My first attempt was to use [11ty](https://www.11ty.dev/). It is an interesting tool and provided me a way to reorganize the templates for the blog and dynamic content.

Then I stumbled upon some issues with their documentation and "advanced use cases" like generating pages without the pesky `.html` extension.

For it to work you have to create _a folder_ and then add an `index.html` file there. 11ty made it difficult.

I'm not trying to roast 11ty here, it is a really good tool, works great and is very beginner friendly. But I felt I needed more control over how things work than it provided. My main point is I was moving away from dealing with the internals of tools. I wanted something that "Just Worked ™" without me having to dig into the tool's internals to make it do what I want.

## In comes Astro...

[Astro](https://astro.build) is a static site generator much like 11ty, but a little bit more flexible and supports some advanced use cases that came in really handy, like generating the folders with an `index.html` file the way I wanted and a good way to handle collections of data, like blog posts or a list of projects for a portfolio.

Ironically it is built _on top of_ Vite... Surprise, surprise! We came full circle!

The experience of working with Astro was very pleasant. The documentation is thorough and the tutorial covers a lot of ground.

Migrating the blog was a couple days of light work, not very hard to do and I was able to split much of the parts into reusable components, which made it even nicer.

## There are always roadblocks

![AI generated image of a long road leading to a city. The road has multiple police lines and some cars parked along the way creating a blocade.](./assets/road-block.jpeg)

I'm _extremely_ particular about my XMLs, [RSS](/blog/2023/06/xml-is-not-dead/) and [SVGs](https://codepen.io/madcampos/pen/NWRdOeW) and I'd like to keep it that way. One issue that kept me going in circles for a while was generating the post images for the RSS feeds.

The problem with that is that the RSS specification requires that you specify the image size in bytes. And as much as Astro is helpful it doesn't provide a way to get the image size at build time.

A huge shout-out to the [creatures.dev](https://creatures.dev) community, they are amazing and proposed a solution: make a [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) call to get the image and use the [`Content-Length` HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length) to get the size in bytes of the image.

That didn't work. `fetch` was trying to get the image from an online server and it was returning a `404 - Not Found` error because the image was not online yet.

The next try was to get the image using node's [`fs.stat`](https://nodejs.org/api/fs.html#filehandlestatoptions) method. That didn't work either. Sorta...

I brought that problem to the [Maple Code Mob Programming session](https://www.meetup.com/maple-code/events/298220178/) and got help from the lovely folks there. But I got frustrated with things not working and didn't want to waste everyone's time with this. I gave up for a bit and used a default file size of 10Kb.

But the problem was still in the back of my head.

## RSS Wars: The Feed Strikes Back

My final solution was pretty hacky. Here is the code if you are curious: https://github.com/madcampos/madcampos/blob/main/src/pages/blog/feed.xml.ts#L27-L38

In the end I had to still use the `fs.stat` call, but have to do some processing on the file path so it can point to the correct place where the file is and be found.

That processing is different for both the dev server and the build for production. There is where the hack lives.

I'm not proud of the hack, but it works!

## RSS Wars: Return of the Validation

Turns out I didn't need to be so hacky... After opening a [Pull Request with Astro's repository](https://github.com/withastro/astro/pull/9749) and some back and forth about what the best solution would be, I was directed to a best practice from the [RSS Board themselves](https://www.rssboard.org/rss-profile#element-channel-item-enclosure:~:text=When%20an%20enclosure%27s%20size%20cannot%20be%20determined%2C%20a%20publisher%20SHOULD%20use%20a%20length%20of%200) that said:

> When an enclosure's size cannot be determined, a publisher SHOULD use a length of 0.

It turns out the problem was in Astro's _validation_ that didn't allow for a `length` of `0`. I sent a [Pull Request with the fix](https://github.com/withastro/astro/pull/9967) and that is it.

## Conclusion

All the changes, migrations and experiments were for the better in the end. It led to a simpler structure and easier to maintain code that works just the way I want and offers me opportunities to expand and extend it.

But, not everything is without trouble and it is awful to be stuck with the same problem for some time. It is worth to have a working solution, take a step to get your head away from the problem and then come back to it with a fresh head.
