---
title: Accessibility tips for junior developers
summary: Some tips for educating junior developers in accessibility and developing empathy.
image: ./assets/pexels-kevin-ku-92347-577585.jpg
imageAlt: A photo of a computer screen, and a pair of glasses, the screen is blurred on the background, and the only focused part are the ones through the glasses lenses.
createdAt: 2025-05-15T22:50:52
tags:
  - a11y
  - Accessibility
  - coding
  - html
  - LearnToCode
  - ProjectManagement
imageRights: "[Photo by Kevin Ku](https://www.pexels.com/photo/data-codes-through-eyeglasses-577585/)"
---

First, today, May 15th, is [Global Accessibility Awareness Day](https://accessibility.day/). I was planning on posting this in advance but got side tracked. So here it is, better late than never. Now, onwards to the post...

During the last [#a11yTO Camp](https://a11yto.com/) they opened the floor for impromptu lightning talks. In my usual demeanor about doing cool but unexpected things I said "eh, why not?", shrugged, put my name to go there and talk and then thought: What am I going to talk about?!

## Project Management and You

A while back, in another community I am involved we started a project to develop a volunteer management system (VMS) for the Toronto JS community. We did have a problem of people being too busy with other stuff and didn't want to manage the project. Again, I asked myself "eh, why not?", shrugged, and volunteered to be project manager.

One of the thing I am very vocal since the beginning is that accessibility is part of the process and we should all do our parts for having an accessible application.

## There and Back Again

For the talk at #a11yTO Camp I then decided would be interesting to talk about my recent experience reviewing pull requests and advocating about accessibility in the project.

## Context is everything

For the VMS we have lots of passionate developer that are awesome to work with. They are smart people, eager to learn, and very motivated.

What happens is most of them are just starting their careers, so their contact with accessibility is usually very limited. In most cases it went just as far to know that semantic HTML is important, but not _why_, and not exactly what "semantic" even means.

That gap in knowledge is not a problem, after all, we learn everything we do and no one was born knowing everything. It just made me realize I should take the scenic route and expand upon the whats, hows, and whys.

## Tip #1: Explain _why_

The first thing is to explain why something is what it is, and why we should do it like that. For example, when talking about semantic HTML, explain what that means, including talking about landmarks, what they are used for, and how people navigate using them.

It helps to give people the context they need to understand things and learn how to identify and use patterns. We learn something better when we have a reason for it than just a flat fact without any context.

## Tip #2: Reference reputable sources

We are talking about web development, so here _the_ "go to" source should be the [Mozilla Developers Network (MDN)](https://developer.mozilla.org/en-US/) docs[^1]. They are maintained by Mozilla, but the data there is [available on github](https://github.com/mdn/content) and anyone can contribute! Other browser vendors also contribute to make that the best source for documentation about the web.

Another source, specifically for accessibility is the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/), it is a collection of patterns, examples, and explanations on what are the expectations in terms of accessibility for some interactions on the web. One example of that is tabs, they list what is needed for making an accessible tabs component and what types of interactions are expected, with examples.

So, why links to documentation? It is usually very dry and not the most exciting reads in the world, some documentations can be arcane and cryptic as well (I'm talking to you Java).

The important thing though is creating familiarity, even being boring, sooner or later we will have to go through the documentation for the tools that we use. Learning how to navigate those and how to read it helps.

## Tip #3: Show and Tell

An important part of the puzzle is to _demonstrate_ what we mean. Using tools like [Wave](https://wave.webaim.org/) or where to find the accessibility information on the browser developer tools adds to the explanation of things.

It makes something abstract become concrete. For example, saying "semantic html is important" and then showing a report of the landmarks and heading levels on a page makes the connection between concept and application happen.

## Tip #4: Pair code and test together

It is scarry to use a screen reader for the first time. You have a robotic voice yelling at you things that make no sense. It is information overload. It takes time to build the skill and level of comfort that you can just use it and not feel intimidated[^2].

Pair coding, screen sharing, and recording videos are all great ways to help people to experience things in a safer space.

## Final tip: Pay attention

That's it: pay attention to what people say, be empathetic. We are all together.

[^1]: Funny enough, my searches for web related content always start with "mdn" + language + topic.

[^2]: Little anecdote here, I was recently developing and testing some piece of code and used a screen reader to verify it was doing what it was expected to do. My partner was in the office with me, listening to all of the talking, he stopped me and asked about that as it was new and unexpected for him.
