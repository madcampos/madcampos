---
title: Zalgo - And other Unicode Eldritch Horrors
summary: A deep dive into text encoding and JavaScript, it's challenges and how to solve them.
event: JS Tech Talk [In Person] - September 2024
eventUrl: https://guild.host/events/js-tech-talk-in-person-ixwtxw
date: 2024-09-25T18:00:00
isOnline: false
address: 260 Queen St W, Toronto, ON M5V 1Z4, Canada
image: ./assets/zalgo.jpg
imageAlt: A black background with an ASCII art drawing of Cthulhu in dark green.
slides: https://1drv.ms/p/s!AivyfQGK_lAizbRbiGBlk0dv64hEKA?e=hATqir
code: https://github.com/madcampos/oldwebtext
demo: https://owt.madcampos.dev/
techStack:
  - JavaScript
  - Unicode strings
---

What happens when you are faced with some of the most mind bending things in computer history? Does the abyss stare back at you?

## Understanding Unicode

In the ancient times, there was no standard on how to represent text by computers. Then IBM created ASCII, a way to represent text by computers. It was good but only represented latin scripts, so everything else was excluded.

Then came the idea to represent every and all possible scripts made by humans (including things like [Linear A](https://en.wikipedia.org/wiki/Linear_A) and [Linear B](https://en.wikipedia.org/wiki/Linear_B)). The problem then became the size those "characters" would take. Even the most simple text would explode in size as we would need more bits to represent everything.

The ingenious idea of Unicode was to have a _variable length_ encoding for code points. Code points are how Unicode identifies the idea of a _grapheme_. For now let's think of graphemes as "characters".

## Surrogate pairs

The way Unicode encodes the _variable length_ is using a thing called "surrogate pairs", that means that instead of having every single grapheme be a single "unit" some graphemes are composed of multiple units, where the first one says "hey, here comes a more complex grapheme that needs more space", and then the following ones indicate what the grapheme actually is.

## Graphemes

A grapheme can be very philosophical as it is a "unit of text", if usually means a "character", but can be a character _with an extra marking_ like "á", "ô", or "ñ".

The most interesting part is that graphemes are language dependant, what is a single character for one language may be a combination of characters for another one.

## Strings in JavaScript

All strings in JavaScript are manipulated using UTF8, that means they are split in 8bit "chunks", even though internally they are stored in UTF16.

That means, when we use methods like [`split`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split), it will break a surrogate pair into it's component parts.

To avoid this, we can use a very clever trick and _destructure_ a string, that will make each part retain surrogate pairs.

Other tools to deal with strings include:

- [`String.normalize`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) for making characters behave consistently.
- [RegExp's Unicode Character Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape) for filtering out specific groups of characters in a more manageable way.
- [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) to split strings by letter, word or phrase.

## Old Web Text

A while back I wrote a small application that would take any text and map it back to different characters so it is _visually_ different.

This is done by using the tools mentioned above, so a string of text gets normalized, cleaned, and then mapped to something else.
