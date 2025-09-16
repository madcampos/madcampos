---
title: Accessible skill trees
summary: How to represent a skill tree accessibly
createdAt: 2024-10-11T11:31:56.641-04:00
draft: true
tags:
  - a11y
  - Accessibility
  - coding
  - html
  - gaming
  - diablo
---

One of my favorite games is Diablo, I've played all entries on the franchise to the point where one of my core memories is: of me playing a werewolf druid and making way through the jungles of Act 3 on Diablo 2.
All there with [the best electronic music record](https://open.spotify.com/album/4fdgcEVMdJe0KVgupMNJAP?si=wLTwbrl7Ty6QRY5je9UP8Q) as the soundtrack. It was a frenzied clicking while ravaging through the hordes of hell.

Back from memory lane, nowadays I'm playing Diablo 4 a lot, most of the time with the awesome Florian Beijers. Go check his [channel on Twitch](https://www.twitch.tv/zersiax)!

On one of those play sessions I was talking about character builds and asked Florian if the guides are accessible for screen readers, to which he replied:

> Mostly they are, _the only confusing part is the skill tree with lots of jumping around_.

That got me thinking: _how bad are the skill trees and how to represent hierarchical content in an accessible way?_

So if you, like me, is on a quest to slay the hordes of [accessibility hell](https://www.htmhell.dev/) and bring harmony to the [world of web sanctuary](https://diablo.fandom.com/wiki/Sanctuary), this post may offer you the needed [buff](https://en.wikipedia.org/wiki/Status_effect#Buffs_and_debuffs).

## The Prime Evils[^1]

Representing information to screen readers can be challenging, specially because they work mostly in a _linear_ fashion. That means, information is conveyed in _sequence_ to the user, from start to finish most of the time.

Let's get meta and use this blog post as an example. A screen reader would read everything, starting from the title, going one paragraph at a time, and then finish with the footnotes.

This creates an interesting challenge as we have to _linearize_ our tree into a sequence of items. This discrepancy between a sequential representation for a screen reader and the "2D" visual representation is where the biggest problem lies. How do we sequence the tree? Depth first, breadth first, or randomly?

## The Soulstones

In the Diablo lore, there are these very powerful stones that are meant to trap and tame the big bad demons you fight. Those are the soulstones.

Continuing with the Diablo analogy between Diablo and the Web, that would be Accessible Rich Internet Applications (ARIA).

The ARIA set of standards and guidelines provide a way to expose complex interactions in an accessible way. Basically, anything cover by semantic HTML like `button`s; or not covered by that, like `tab`s is described by ARIA.

Most of the time, we don't need to use ARIA, and we shouldn't. It gives us the powers to do almost anything we want, so misusing or overusing it may actually hinder accessibility.

Much like the soulstones were devised to trap devils inside them, they also influence and corrupt people who uses them. So, use ARIA carefully, or it will create a hellscape for your users instead of actually helping them.

## You gained a level!

When you gain a new level on all Diablo games starting from Diablo 2, you gain a skill point. Those points are used to do bigger, better, and more destructive pyrotechnics, to the point where a high level character can't figure any thing out on the screen and the game sometimes lag trying to render all the effects going on.

Every game in the franchise have a different way of presenting and dealing with skills.

On the first game, the interface represents a spell book similar to a mage's grimoire in Dungeons & Dragons. It is presented to the player as tabs representing spell levels, and each tab having just a list within. If you want to read more about how to create a tabs component, please look [this post on accessible tabs](/blog/2023/07/tabs-web-component/).

Diablo 3 simplified the skills system to the point where it is quite similar to Diablo: a bunch of tabs, called "categories", and then only a tiny handful of skills on each.

Things get interesting on the other two games of the franchise: Diablo 2 and Diablo 4. They present skills to a user in the form of a tree, or a flowchart.

In Diablo 2, those are presented as a list of tabs, where each tab has a tree to follow, the tree is laid out in a grid, where rows represent level ranges starting from the top with no level requirement, and getting to the bottom with skills and level requirements to have access to more powerful skills. The columns represent paths you can make within the same level range. Dependencies between skills are made using arrows pointing from a prerequisite skill, to the one it enables.

Diablo 4 works on that idea by also presenting a tree. The main difference is that is has some "core nodes" representing main sections on the tree, and then each node open up to a list of options you can chose within it. Some options require other skills to be selected first.

The layout follows a zig zag pattern where the main nodes are either on the left or the right side of the skill tree, and they follow downwards to the next main node. The branches for those nodes are disposed in a radial manner, like branches on an actual tree stem from the trunk.

Okay, but what does it all have to do with HTML and web development?

## The Sisterhood of the Sightless Eye

As much cool as the semantic HTML is, it doesn't provide every single possible interaction imaginable by human and non human beings. `TreeView`s are one of the patterns that are not provided. So we are going to explore that now!

[^1]: [The Prime Evils](https://diablo.fandom.com/wiki/Prime_Evil) are Diablo, Mephisto, and Baal. The three brothers that rule the kingdoms of hell in the Diablo Franchise.
