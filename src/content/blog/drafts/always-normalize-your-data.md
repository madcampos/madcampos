---
title: Always normalize your data
summary: An argument about systems design and how to handle input data
createdAt: 2025-09-23T11:58:56.128-04:00
draft: true
tags:
  - coding
  - protip
  - SystemsDesign
---
So... I was reading [this article](https://43081j.com/2025/09/bloat-of-edge-case-libraries) and the gist of it resonated with something I have got into arguments at work before:

> A well designed library \[or internal system] would assume the right **data types** have been passed in, but may validate that the **values** make sense.

The article approaches it from a library perspective, so let me approach this problem from a consumer perspective.

## History time

In a previous work, we were working with a backend that connected multiple third-party services together and provided a cohesive API to the frontend.

Well, let me tell you about one of those third-parties... It was a PITA (not the bread) to work with. The data was very inconsistent and had multiple holes, here are some examples:

- Sometimes the results would be an array of objects, other is would be one object.
- Depending on the query parameters _values_ passed to the API, the resulting data would have a different format. For example, if you pass parameter `x` with value `y` it returns one format, but with value `z` it returns _another format_.
- Depending on which query parameters were passed to the API, the resulting data would have a different format. For example, if you pass parameter `x` it returns one format, if you pass parameter `y` it returns _another format_, if you pass both `x` and `y`, it would return _yet another format_.
- All of those combinations of parameters are not consistent. Changing one value may result in totally different and unexpected data.

Yeah, that was headache inducing. Indeed I had some headaches from dealing with this data...

## The problem

The problem we have here is that data is _very_ inconsistent. How can we minimize checks, tests, and data validation while keeping the application robust?

## The solution

> Data should be normalized to an internal format and all of the internal backend code will not do validation.
>
> Checks for optional parts of the data, "enums"[^1], and other bounds (like min and max values) may be done where needed, but should be avoided.

## Data normalization

This is the most important part and avoids checking over and over for the same conditions. This helps with performance making the application be fast while still ensuring things work in a predictable manner despite the chaotic third-parties.

You may be asking "what it looks in practice"? And the design is very simple.
Every API request passes the returned data to different `normalize...`  functions.

Every request to third party services already require some "low level" things to be done, like include an authorization token or some headers that are, well, required by the API. So this is wrapped in a function to do the actual HTTP request and return a response.

This first function should do some general validations, like the HTTP status code and if the response is valid JSON, etc.

Then for every third party endpoint that should return a specific piece of data that follows a format, the result from the API request will be passed to a _normalization function_, and here is where the magic lies.

This normalization function should take care of making the input data coming from the third party strictly conform to an expected internal format. This includes:

- Setting default values.
- Converting between objects and list of objects to always return the same format.
- Handle combining different pieces of data into one single piece.
- Pagination if the data needs to be handled as a single unit instead of in "chunks".
- Pagination if the data will be exposed as chunks with information about offsets, number of items per chunk, total number of items, etc.
- String normalization.
- Number clamping.
- Conversion between `null` and `undefined` values to one of them.
- Mapping properties and values to other internal values.
- Deriving complex values based on the data received.
- Handling and normalizing dates (i.e. timestamps and date formats).
- Transforming values from one format to another.
- Handle [unicode](https://madcampos.dev/talks/tojs-unicode/).

It is a lot, it is long, it is boring, it is dull, and it is verbose.

## Why dull and verbose?

Those are actually good qualities of this type of code. This is the place in the code where an object with 100 lines where each property is explicitly defined is _actually good_.

It may seem counter intuitive, specially when we sing the mantra of DRYness, but when transforming input data we need to be very explicit to avoid introducing extraneous data that may break unintended parts of the system and to specifically handle every part we need to.

As verbose as it seems this code is usually very readable and will help with debugging in the future.

## Extra checks

Although normalizing the data in the first step makes life easier and the code simpler overall, there are still some situations where we need to have checks for some of this data. the interesting effect of these checks though is they are _business logic_ related.

Imagine you have a list of possible values for some property, each should follow a different code path. Those cases make sense to be checked again even though they have been normalized already as the logic to handle the data will change.

The other case is when displaying data to the user, checks for optional values to hide parts of the UI are valid, as well as checks for some values to display an "empty state" or change the UI in some way.

The question then is: where to draw the line between normalization and extra checks?

The answer is: it depends. There is a balance between what makes the normalization code easy to understand and handy and what adds complexity to that part of the code, as well as how frequent is the transformation and checks required.

If it is too frequent keep in the normalization, if it is somewhat straightforward keep in the normalization, if it is not overly complex keep it in the normalization.

The main point is:

> Avoid checks for "what if..." everywhere by normalizing things at the data source.


[^1]: By "enum" I mean actual typescript `enum`, types with a fixed set of values, or anything that resembled a defined list of options.
