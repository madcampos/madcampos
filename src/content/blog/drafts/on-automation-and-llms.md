---
title: On Automation and LLMs
summary: A case study for how I use LLMs in my day to day work
createdAt: 2026-04-15T10:58:30.642-04:00
tags:
  - ai
  - llms
  - automation
  - WebDevelopment
  - coding
image: ./assets/PXL_20250723_161620684.RAW-02.ORIGINAL.jpg
imageAlt: A photo of a Lego build. In the background, a waterfall on the left, and the arms of a mechanical apparatus on the right. On the foreground a minifig of an alien person, with an all black body with stars in it, they have a green head with a big smile and a flying saucer around the neck and enveloping the head. The minifig is holding a round tile with a battery symbol on it.
imageRights: Photo from a Lego build from 2025
---

Let me preface this by saying I'm in general very resistant to change. I like to wait out a little bit for the hype to settle and have a better understanding of how things work before jumping head first.

## What LLMs are good at?

Risking repeating things that other people said better[^1], let me try and give my view on what LLMs are good at.

It has been said that LLMs are "auto complete on steroids", this is a decent analogy, but only partially true. Auto complete is rudimentary in the sense that it only takes into account a few previous words that you typed to predict the next one.

The thing that makes LLMs shine is it models correlations between words, and to an extent[^2], concepts, in measurable mathematical terms. So for example, we can measure how a term like "apple" relates to "fruits", "computers", "My Little Pony"[^3], and how strong are the relations between them.

Another interesting thing that happens is that LLMs also work with unknown words and made up terms, where your phone's auto complete kinda can't. That gives them a super power specially important for use in programming, as terms like `AwesomeVariableThatDoesStuff` are not "known" words.

And the other aspect that ties it together is pattern matching. LLMs are absurdly good at pattern matching. That means that given a set of examples, it can abstract those examples and adjust new information so it sticks to the pattern provided.

## What LLMs are not good at?

The thing that people talk the most are hallucinations, and it is [proven to be](https://arxiv.org/pdf/2401.11817) [unavoidable](https://arxiv.org/pdf/2509.04664). But that can be minimized by giving the LLM a more concrete task, and again, examples of what should be done.

Related to that is the problem with too abstract and ambiguous tasks. An LLM predicts what the next best "word"[^4] would be.
It does not think and ponder about the meaning of things like us humans do, the "word" here is a set of coordinates with no inherent meaning on itself. But I digress.

The problem with ambiguity is that there is no direct or "correct" answer to what should come next. It is, by definition _ambiguous_. So LLMs will inevitably hallucinate.

On the other hand we have abstract problems.
Going back to the concept that an LLM predicts the next "word", and because the next "word" requires some correlations that are not immediately obvious, or require multiple hoops between concepts. Even for us humans to understand.
Those types of problems are may not be mapped on the coordinate system, or "jumping" from one coordinate to another may not be something the LLM is even capable of doing, unfortunately.

This last point is a pet-peeve of mine. I do hate a "Yes Man" (except, on [Fallout: New Vegas](https://fallout.fandom.com/wiki/Yes_Man), that one is cool).
I wish that the LLM models would be trained to reply more like [Gordon Ramsey on Hell's Kitchen](https://www.youtube.com/watch?v=z5E3xXA_4A0) and plainly say "no" to things[^5].

For most of those shortcomings, the answer is to lean on what LLMs are good at: well defined tasks and pattern matching.

## How do I use LLMs?

I like using AI tools to automate repetitive and annoying tasks from my day to day, some examples include:

- Scaffold components
- Generate/complete schemas
- Find very specific information
- Generate helper functions or logic
- Handling CLI "incantations"

### Scaffold components

When writing components, in the sense of "reusable pieces of code", usually there is some inherent boilerplate around it.
For example, if we take a react component or an api endpoint with open api, both follow some structure and some _pattern_.

For those cases I will usually write a prompt like the following:

> Given this example component \[path to another component\]
> Write a new component named `NewComponentName` that does:
>
> - Some behaivour
> - Some other behaviour

This kind of prompt provides me the scaffolding needed, but importantly, I don't go overboard with all the specific behaviour of the components.
If it is _ambiguous_ or simply _too complex_. I leave it out of the prompt and implement by hand afterwards.

The time spent implementing a harder feature by hand is smaller than prompting the LLM to "fix this please" multiple times to no avail.

The hard problem here is recognizing what "too complex" means.

### Generate/complete schemas

The case here is when writing a schema validation, or consuming a third-party API that has lots of fields. It is easier to just prompt and get what you need, iterating over as necessary.

A concrete example was recently I had to integrate with a third party API and normalize the data, providing fallbacks to the fields. The only things I had were a dream and a 5k line json response.

So I gave the LLM the json and prompted:

> \[path to json object\]
> Given this json object coming from an API, write a normalization function that:
>
> - Takes an `unknown` input
> - Maps all fields to camel case versions of them
> - Fall back to `undefined` if the field is not present

This gave me a starting point to which I iterated over, with subsequent prompts to add parsing and formatting for numbers and dates that were returned as strings from the API.

The secret here is iterating over the problem and not trying to cram all things in one go[^6].

### Find very specific information

Sometimes we know what we need but have a hard time expressing the concept in code. Yeah, those moments. LLMs are handy at interpreting those and translating into something.

One example that happened recently was that I didn't remember the specific CSS property and value to keep line breaks within an element while collapsing whitespace.
Very specific, but also not something I do frequently, so I didn't remember the exact properties.

Instead of digging through multiple pages on MDN I asked the LLM for that information. It pointed me in the right direction.

I then tested to be sure it was doing what I wanted and it indeed was, and read the [MDN article](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/white-space#pre-line) to confirm that was what I was looking for or not.

It is important to always verify if the LLM output is indeed what you are looking for. It is good for pointing you in a direction to go, or figuring out the specific terms for something, but you need to always double check.

### Generate helper functions

The case here is simple to understand: no one wants to parse dates in Javascript[^7].

But sometimes we have to do it and don't want to bring in an entire library like [`moment`](https://momentjs.com/) (which has been deprecated and unmaintained for years now), or [`date-fns`](https://date-fns.org/) to do _one_ parsing. It is overkill.

So, it is easier to prompt an LLM for the solution, as it is usually a well defined and small problem. It may be hard to read for humans, but is easy for machines.

### Handling CLI "incantations"

As best stated by the title text on [this XKCD comic](https://xkcd.com/1597/):

> If that doesn't fix it, git.txt contains the phone number of a friend of mine who understands git. Just wait through a few minutes of 'It's really pretty simple, just think of branches as...' and eventually you'll learn the commands that will fix everything.

Sometimes we want to do more complex things in `git` than `push` and `pull`, like see a list of commits from a specific user across all branches[^8].

I don't need to listen to a few minutes (it is never a few minutes) or sift through a few stack overflow pages (it is never a few pages) to figure the correct CLI incantation to use.

Most of the time, I just need a quick and dirty solution, and that is good enough, so all of the background of how [git internally stores things](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) is irrelevant for the task at hand.

For those cases where you need a quick answer and not a treaty on the origin of the universe, yes, this is indeed a good use case for LLMs.

## Conclusion

It would be dishonest of me to say LLMs are not good tools. They are. But it would also be dishonest to say that [software engineering is dead](https://stackoverflow.blog/2026/04/15/why-ai-hasn-t-replaced-human-expertise/).

LLMs are a powerful and complex tool, but not a panacea that works for every single problem imaginable[^9]. We need to know what they are best suited for and what are their shortcomings to make the best use possible.
The experience of a software engineer comes handy to spot where things might go wrong, where it will be _less_ work to use an LLM, and where it would be _more_ work to use an LLM.

To summarize, my guidelines are:

- Use it for pattern matching.
- Give it well defined tasks, examples, and boundaries.
- It is an iterative process, don't try to do everything all at once.
- Always verify and understand what it is doing.

Having the expertise to know what and where to use LLMs is the great differentiator in the current times, I think. It is being smart and aware of the pros and cons of the tool.
It is the difference between using a black box that you ask "please fix this" while going in circles and a time saving and performance improving tool that will make you be actually faster.

[^1]: So... I spend too much time online and have been bombarded by articles on AI for a while. That skews my perspective on how aware people are at things. But trying to cater to an audience not so chronically online, I'm adding this section.

[^2]: The current models compress information, as it is currently impractical to have a multiple dimensions (in the mathematical sense), where each dimension is a "word" in the whole entire and complete list of all existing words, in all languages known to humanity. That is a big and impractical number... for now...

[^3]: There is [Applejack](https://mlp.fandom.com/wiki/Applejack) and her whole family for instance.

[^4]: I know it is "token"s, but for simplicity sake, we can thing of that as mapping mostly to words.

[^5]: While it is _technically_ possible to have an LLM say no, but this is an extra step, not something _baked in_.

[^6]: There is a saying in Portuguese that goes like this: _"\[It is\] like trying to whistle and suck on sugar cane."_ One requires you to blow air out of your mouth and the other requires you to suck on the sugar cane, both opposing each other and impossible to do at the same time.

[^7]: Thank goodness the Temporal API is coming to all browsers. Also taking the opportunity to bash on Go's date formatting: it could be [way worse](https://pkg.go.dev/time#Layout).

[^8]: In case you are curious: `git log --all --author="Some Name or email" --pretty=format:"%h %ad %an %s" --date=short`

[^9]: That old saying is telling and a cautionary tale here: _"when all you have is a hammer, everything looks like a nail"_.
