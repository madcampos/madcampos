---
title: Complexity and tooling
summary: A reflection on project complexity and modern tooling
createdAt: 2024-09-12T23:43:58.381-04:00
tags:
  - WebDevelopment
  - hot-take
  - meta
  - web
---

It is interesting how cyclical the tech world is and some things seem to "slow cook" and then all of a sudden come to a "boil". Let me expand on that...

## The end is nigh

For y'all doomsday preppers out there, no, it is not an omen that we are facing the collapse of capitalist society and a climate catastrophe that is almost impossible to recover...

We are not talking about _that_ impending doom. We are talking about tech, where things are much worse!

It seems there is a lot of sentiment around simplifying our tech stacks and the tools we use, try to reach for less things instead of more. I'm hearing a lot more people talking about this than two years ago.

To me, it sounds like we are at a turning point. I learned recently about ["the principle of the least powerful"](https://www.youtube.com/watch?v=IP_rtWEMR0o), or at least learned the name for a feeling that is in the back of my head for a while. And apparently, I'm not alone, just today, [a new article](https://adactio.com/journal/21397) came my way talking about "no build tools". It is interesting to see this sentiment of moving away from excess tooling rising.

## JavaScript burnout

It is an old joke now that every second a new JavaScript framework is released, so let's unpack that joke.

JavaScript has a very low barrier of entry compared to more classical programming languages like Java or C.

\[cue trip down memory lane\]

<div style="filter: sepia(1); background:#daa5203a;">

I remember back in university it never made sense to me why we need to declare a `main` function? Why can't my code just run sequentially and that is it. Worse still, this is very cryptic:

```java
public static void main(String[] args) {
	System.out.println("Hello, World");
}
```

What does `public` mean? What about `static`, `void`, and `args`?

For someone who is writing their first line of code ever it is very intimidating and at the time I was told to just copy it and accept it. Now I understand what all of that means, but 18 years old Marco, fresh out of high school _did not_.

There was something there for me, but I didn't know what yet. And this whole arcane incantation was on the way.

Then when you look to JavaScript, your code is just:

```js
console.log('Hello, World');
```

It is much more accessible, much _easier_ to get started!

Aside from that, Java required a 500mb download for some random tool, plus picking a Java version, choosing between Java EE, Java SE, and Java ME, and picking a JDK (whatever the hell that means[^1]). So JavaScript is a blessing, you just need your browser!

</div>

\[End of trip down memory lane\]

Okay, back to good ol' JS. This lower barrier of entry meant that people from all backgrounds and that didn't have formal training started programming. That on itself is a very good thing. People should learn how to program even if they don't use it in their day to day.

But that creates tools with wide range of quality, fast forward 10 years and we have lots of new tools and frameworks and what not coming out every other second. It is a lot to keep up. We are burned out.

## CSS is good now

On the other hand, it always strook me as very weird that to every problem, the solution is just throw _MORE_ JavaScript at things!

When webpack came out, it seemed like a good idea: we have heavy websites and bad internet, so let's use clever tricks to load the code in more optimized chunks.

But now, we have better support for lots of things natively. We don't need a JavaScript library that is prone to breaking to create a keyboard trap, there is the [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) element and the [`inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert) attribute now. It Just Works ™, no extra code needed. CSS is good now, we have [`grid`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid) and [`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)!

## Death by a thousand dependencies

To me, the interesting part in all this is that although we have all those cool new features, there are still a lot of legacy code bases. We are suffering the consequences of the choices of yester-we.

I'm not saying it is all bad decisions, but we are facing the results of over relying on complex tools and throwing more JavaScript at the problems.

When we look at codebases, we need to ask ourselves: what value does this added dependency brings?

No, we are not writing everything from scratch and reinventing the wheel. But at the same time, do we really want to depend on code that will never change and will be written in 10 lines? Do we need to abstract away things [simply because we don't understand them](https://tailwindcss.com/)?

It strikes me that people start new projects with a [heavy handed solution without even knowing the problem to solve](https://x.com/mattpocockuk/status/1832318143294738784). If I can take one thing from university, and Java is not that, it is that when I start a new project the first thing is sketching it, it is _thinking_ about what the problem is. Once I know the problem, then I look at solutions and what tools may be useful to solve that problem.

But apparently I'm the exception and the consensus is to start from a toolkit and then fit the problem to your tools.

## It's the circle of life

One interesting phenomena that I observe after this time is that all of the change in tools, this movement where what was cool is now "legacy", have happened before and is happening all over again.

At one point, Flash was the coolest thing ever, then was rounded border, then jQuery, then react. All of those marked by a cycle of discontentment with the _status quo_ tool and a "back to the basics" approach. So, my questions are: Are we at the end of a cycle? Then, what waits us next?

[^1]: Yes, I know it stands for Java Development Kit, but imagine you hear this alphabet soup for the first time how frustrating it is.
