---
title: Roleplaying with the ghost in the machine
summary: No, I don't like the whole "spend more time writing a spec" thing, here is why.
image: ./assets/geisha.png
imageAlt: Close-up photo of the geisha robot from the Ghost in the Shell movie. It shows a woman's face, painted in white with a red circle. The face appears made out of porcelain and has thin seams running all over it, splitting the face in multiple parts. The eyes are metallic and dark, with no pupils.
createdAt: 2026-05-06T11:15:40.811-04:00
draft: true
tags:
  - LLMs
  - RPG
  - Rant
imageRights: "[Ghost in the Shell](https://en.wikipedia.org/wiki/Ghost_in_the_Shell_(2017_film)) movie, 2017"
---

I've been hearing a lot of anecdotes from friends and colleagues about how the use LLMs. Most of them include some of the following points:

- Roleplaying with the LLM. (E.g.: "You are a specialist in \[field of study\]...").
- "I write a long and detailed specification".
- "I don't spend time writing code anymore, most of my time is in writing the specification."

And I hate all of those.

## Not writing code

I won't dabble too much here but the new buzzword for this seems to be ["comprehension debt"](https://addyosmani.com/blog/comprehension-debt/). That means you literally have to workout your skills or else those [get atrophied](https://erikjohannes.no/posts/20260130-outsourcing-thinking/index.html) and you don't understand how thigns work anymore. Plain and simple.

The hard earned skills that make senior devs be senior in the first place, that LLMs are supposed to make easier end up making people lose their edge and skill.

Aside from the fear of losing my skills, I also _like_ writing code. I became a developer not because it pays well, if I wanted a good salary I would have become a doctor as my father wanted.[^1]

But here I am, liking to type things on the keyboard. And no, I don't like _every single piece of code_ I write. For example, I dredge writing tests, or SQL, or even some JS sometimes. The point is, as much as there are things I don't like about my job, I do like most of it.
I like it the extent where I have some coding side projects. It is similar to the Mean Girls meme: ["I was possessed... I spent 80% of the time talking about it..."](https://www.youtube.com/shorts/duMQSdmRQlg)

## Roleplaying with the LLM

As much as adding a role to LLMs seems to be the most understood way of narrowing it to not produce as much "hallucinations", it does not help that much if your role is right at the beginning of the prompt and other important keywords show up afterwards, [drift is inevitable](https://arxiv.org/pdf/2601.04170).

On a more personal side, if I want to roleplay I would rather play D&D. To me that play of pretend with the LLM is just fake and uncanny. It gives me a bad taste instead of bringing joy.

## Writing long specifications

That is an intersection of the previous two points, but also one on its own. It builds upon the notion that writing code by hand is obsolete and that you have to roleplay with the LLM.

But to me the most insidious issue is that it removes agency and exploration from the process. It feels like we are back to [waterfall](https://en.wikipedia.org/wiki/Waterfall_model) and forgot about the iterative ideas of [agile](https://en.wikipedia.org/wiki/Agile_software_development).

Although agile is not perfect, it does have one core principle that resonates a lot with me: it is iterative. I feel with the "write big specs up front" we are back to the previous model.
The problem is aggravated by how bad LLMs deal with uncertainty. When starting a project, I don't have all the answers, at most I have an idea and a rough series of steps to achieve it. Yes, there is an end goal, but the path leading there is not define and not precise.

That fuzzy path is _precisely_ the point of iteration.

## Detour on DMing

A Dungeon Master, or DM for short, is the person responsible for running a D&D game[^2].

A long time ago, I was having a conversation with my brother and some of his friends about how to, as a DM, structure a "mystery" adventure. Something like a Sherlock Holmes or true crime inspired story.

In terms of structure it would be simple:

1. A crime has happened
2. The players have to find clues
3. Clues move them closer to finding who is behind it
4. Iterate a couple of times
5. Face the bad guy

Then the question was: how to give just enough information to keep players engaged and make the story unravel instead of just dumping things on the them?

The answer was:

> Create a handful of locations, like a bakery, the house of the mayor, etc.
> Each location should have just a handful of clues, like two or three pieces of information that will lead to solving the mystery.
> People can point to directions, like talking to a maid and she will say to look at one of the locations.
> Add a couple of incorrect clues to misdirect the players.
> Finally and most importantly: _let them explore and build their own path_.
> Once they explored the majority of places or have most of the clues, point to the location to face the bad guy.

That was an epiphany moment for me, letting the players explore without [railroading](https://tvtropes.org/pmwiki/pmwiki.php/Main/Railroading) them. It makes the game more engaging for both sides and let's me not worry too much about how things will happen. The side quests are important and give context to the main quest.

## _D&D_ Planning

One thing that seems to confuse people the most about agile is that they think there is no planning involved, _at all_.
In fact there is a lot of planning. But the big gotcha is where to stop planning and start acting on it and where to go back to planning.

With the DMing example from before, yes, there seems at first to be a lot of planning, that I would need to lay out the entire story up front, but that is not true.

I would only need some things:

- A couple, like, literally two or three places described.
- The clues for those places.
- The people involved in those.

The other places and the rest of the story, like the bad guy's lair can be as vague as "there is a bad guy lair" and it is _fine_.
I won't expect nor want the players to figure everything out in a 4 hour session of playing. I want them longing for more, stopping at a cliffhanger with questions, with theories, with ideas about what is going to happen next.

_I_ won't even know what happens next. And that is the genius of it!

## _Project_ planning

The same thing happens when I'm architecting and working on a project. I have no clue what comes next and that is okay.
The exploration and side quests are important, but the argument of "writing the spec up front" robs me of that.

I have to think about things that _will_ change, about thing that I don't know yet, and about things that, in hindsight, will not work together and need to be adapted.

From [Software engineering economics](https://openlibrary.org/books/OL4267874M/Software_engineering_economics), we learn that the core principle is: the cost of things grow as we move from idea, to prototype, to product.
The speed of outputting code from LLMs, doesn't alleviate it, in fact it exacerbate how quickly this cost compounds.
So deciding everything upfront instead of iterating over things as you go makes the project harder to evolve and bound to the constraints set up before the problems even arise.

## Conclusion

No, I don't like roleplaying with the LLM because it feels weird and I don't think it helps that much.

No, I don't like planning everything ahead because the exploration is an integral part of the process and changes _will_ happen.

No, I don't like to give up coding because it is fun and one of the main reasons I'm doing it. (Also, [coding speed is not the problem](https://andrewmurphy.io/blog/if-you-thought-the-speed-of-writing-code-was-your-problem-you-have-bigger-problems)).

Thanks, I hate it! 💖

[^1]: Along with the daddy issues, I can't stand seeing blood for too long, it makes me dizzy and nauseous. So yeah, being a doctor is a no go.

[^2]: Other names include "Game Master" or "Narrator".
