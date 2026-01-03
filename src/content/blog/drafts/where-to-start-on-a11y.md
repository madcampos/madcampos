---
title: Where to start on Accessibility?
summary: An intro to the process I do for accessibility
createdAt: 2025-10-16T10:08:10.597-04:00
draft: true
tags:
  - a11y
  - Accessibility
---

> When you talk about accessibility in a dev–designer setting for digital products, what exactly does that usually mean in practice? And how do teams typically start on those things — like, what are the first few steps to actually implement accessibility (beyond visual checks like color contrast or focus states)?

Interesting question, and awesome that you are interested in accessibility!So, let me break down the question and answer each part...

> When you talk about accessibility in a dev–designer setting for digital products, what exactly does that usually mean in practice?

There are a couple things here. On a more general and "abstract" level, depending on the project there are legal requirements, but there is also the ethical argument for making things better for everyone.\
The legal part is specific to each county you are working with, but the general rule of thumb is everyone bases their laws on the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG22/) with a conformance level of AA (it has 3 levels: A, AA, and AAA) ([here is an alternative to reading the WCAG](https://aaardvarkaccessibility.com/wcag-plain-english/)).On a more concrete and practical sense, what I mean with "making things accessible" is:

- [Have semantic HTML](https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html)
- Make things [keyboard](https://www.smashingmagazine.com/2025/04/what-mean-site-be-keyboard-navigable/) [navigable](https://webaim.org/techniques/keyboard/)
- Have good [color contrast](https://webaim.org/resources/contrastchecker/)
- Test with a screen reader how things work
- Prefer streamlined and easier to use UX

Most of those things overlap, so by using semantic HTML things will usually be keyboard navigable and work decently with a screen reader.\
To give an example, imagine a button on an interface. The most logical choice for a tag to use is `<button>`, but some people choose to use a `<div>` instead.\
When you use the proper semantic tag, [lots of things come for free](https://www.w3.org/WAI/ARIA/apg/patterns/button/):

- The button can be reached by tabbing through the page to reach it
- It works by clicking, touching, pressing the enter and space keys, pressing the "ok" button on a tv remote, pressing the "A" button on a game controller, etc.
- It will be listed as a button for screen readers, making it easily reachable through shortcuts.
- It will provide easy interactions to people using other assistive technologies like voice control (they can say something like "click <text on the button>" and it works)

If you choose to go the "un-semantic" way, all of this is forfeit and have to be reimplemented from scratch.\
Developers are super lazy, so usually they will leave a half baked or broken implementation there.The streamlined UX is in the sense of making it easier for users to use whatever you are building, if we can offer anything simpler than an airplane control panel, then we should do it. Simple as that.Taking a more holistic word to summarize it all we can say it adds _affordances_ to the interface.

> And how do teams typically start on those things — like, what are the first few steps to actually _implement_ accessibility (beyond visual checks like color contrast or focus states)?

So, for an actual step by step approach, I usually do this:

1. Think about information hierarchy, usually pen and paper boxes of [how things will be around an interface](https://every-layout.dev/layouts/) and how they relate to each other.
2. With a general idea, a low fidelity prototype, usually in [plain html](https://www.w3.org/WAI/tutorials/page-structure/) helps to consolidate the structure and iron out some details.
3. Then prototype or have a first implementation to test things working, how the flow feels, and make adjustments.
   1. I usually search if there are any [HTML elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) for the interaction I'm trying to build?
   2. If not a single HTML element, is [there](https://open-ui.org/) a [common](https://inclusive-components.design/) [pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) [for it](https://component.gallery/)?
   3. If it is too complex or intricate, can it be simplified or changed somehow?
   4. If it cannot be changed, how libraries, best practices, and people do it? Can I take inspiration?
4. Run an automated testing tool, I like [WAVE](https://wave.webaim.org/)
   1. To understand the errors and the reasoning behind them
   2. Research best practices and advice for things that "feel off"
   3. Implement changes, rinse and repeat
5. Test with an actual screen reader
   1. All of them have options to show visual indicators for what they are reading
   2. You can adjust the voice speed to whatever feels comfortable to you
   3. All of them offer a tutorial to get the hang of how things work
   4. Some screen readers have a "more verbose" option to provide you with interaction options and explain how to interact with something every time, so you don't need to remember everything
   5. I always forget how to use some things and have to go back to the documentation lol
6. If I have the time and resources, go the extra mile and implement visual adjustments
   1. Implement the [more contrast media query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)
   2. Implement the [Windows forced colors media query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors) (this is a fun one)
   3. Review the [reduced motion options](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) (I usually start off without animations and reduced motion, so this is just to ensure I didn't miss anything the first time) ([because of this](https://aaardvarkaccessibility.com/wcag-plain-english/2-2-2-pause-stop-hide/))
   4. Test with [200%](https://aaardvarkaccessibility.com/wcag-plain-english/1-4-4-resize-text/) [zoom](https://aaardvarkaccessibility.com/wcag-plain-english/1-4-10-reflow/)
7. If I'm not sure about how some interaction is working, I will run it with people who use assistive technologies frequently and have more insights on how things work (If there is an option, always compensate people for their time and work!)
   1. There are services for accessibility testing, it can be included in the budget for a project

It may seem daunting to do every single one of those things, so start from #1 and continue down, those are the basics and increase in complexity as it moves down.\
I would say to get comfortable with every step before moving to the next one, try things out, and have an open mind for learning. We all make mistakes, but the willingness to learn from them and improve things is the most important thing ![:slightly_smiling_face:](https://a.slack-edge.com/production-standard-emoji-assets/14.0/apple-medium/1f642@2x.png)
