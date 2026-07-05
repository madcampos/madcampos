---
title: The File System and You
summary: The tricky parts of working with the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
createdAt: 2026-07-05T02:32:55.705-04:00
tags:
  - HTML
  - JavaScript
  - Web Development
  - Building in Public
image: ./assets/20250923_125352.jpg
imageAlt: Photo of Toronto's reference library, from the ground floor looking up. It highlights the smooth curves of the architecture.
imageRights: Photo of the [Toronto Reference Library](https://tpl.ca/locations/TRL/) taken by my partner.
---

Yet another time I stand in front of a problem that needs to read files from the user device. Furthermore, read _and_ keep a reference to files from the user device.

There are two parts to this story, one with broad browser support, and another that is Chrome Only™.

## The problem

I was working on an application that two things: a directory with images, and an SQLite database with metadata about those images.
The application _viewing_ logic itself was simple, it queried the database for some properties and then displayed images accordingly.

Then there was the application _editing_ logic, that one, was not so simple. In short, a user could crop the images and update the metadata on the database.
On the surface, it is all nice and doable from a browser, thanks in part to the amazing [`sql.js`](https://sql.js.org/#/) library that allows to query an SQLite database and avoid the wonders of [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)[^1].

But then... How do I _export_ the database and the files? Specifically, how do I export the files without _asking for the user to download them every single time_? Or rather, how to export a whole folder without forcing the user to click to download _hundreds_ of individual files?

## File System API and OPFS

The good part is all modern browsers support the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) and [Origin Private File Systems (OPFS)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system).

<baseline-info feature="origin-private-file-system"></baseline-info>

Those APIs provide two things:

- The File System API: An abstraction over files, directories, and handles for those.
- OPFS: A directory that the application has access to and can use however it sees fit.[^2]

The OPFS is easy, you call one method and it gives you what you need:

```typescript
const opfs = await navigator.storage.getDirectory();
```

Then you use the File System API to read and write files and directories.
Simple... In theory...

### No paths, only handles

The first "oddity" for a web developer is that you don't deal with _paths_ to things, you deal with _handles_. Similar to using file descriptors for everything when using node.js or doing low level Linux things.

It is indeed a good idea to use handles instead of paths for security reasons. In short, if the file is moved or something else happens, the path may not match the file anymore[^3]. With a path you can't guarantee the file is what you think it is, with a file descriptor you still hold a reference to the original file itself.

That is the crux of [path traversal attacks](https://owasp.org/www-community/attacks/Path_Traversal) and [path normalization issues](https://superuser.com/questions/176388/why-does-windows-use-backslashes-for-paths-and-unix-forward-slashes).

But then, if there are no paths to follow between two things, how do you handle nested files and directories when working with the directory tree?

### Recreating basic file system utilities

Now that is the painful part... You have to recreate some utilities like `mkdir` or `rm` yourself. As well as some path to handle resolutions...

One interesting method is [`FilesystemDirectoryHandle.resolve()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/resolve). If you pass another handle to it, the method resolves a list of the intermediary steps to that handle. It covers the case where the handle is a descendant to the directory.
**But**... if we start resolving from the root of the file system, we can basically move anywhere as everything is a descendant of the file system root[^4].

That gives the tools needed to recreate some tools like creating directories and files _recursively_.

But that leaves some other utility functions that don't directly affect the file system: _Path_ utilities.

### Node `path` module as a start

Although re-creating those functions can be tedious, the node.js [path module](https://nodejs.org/docs/latest/api/path.html) is a good inspiration. And as it is inspired by [POSIX](https://en.wikipedia.org/wiki/POSIX), so there are lots of implementations out there in LLMs training data.
Yeah, I basically prompted a recreation of functions like `basename` and `dirname`.

Then just added a little bit of glue code to use those functions to convert between `string`s and `FileSystemHandle`s.

Unfortunately, nothing is ever easy...

### Naming things is hell in a handbasket

That is the moment when I was hit in the face by one of the best problems in computer science: naming things.

Specifically, [what is and is not allowed in the names of files](https://fs.spec.whatwg.org/#valid-file-name). Unfortunately for us, the specification leaves it open for interpretation... How I love those "[undefined behaviours](https://en.wikipedia.org/wiki/Undefined_behavior)"... 🫠

Anyways, the very basics are covered by the spec:

- File name can't be an empty string
- File name can't be "`.`" or "`..`"
- File name can be a path separator ("`/`" or "`\`")

Anything else you have to try and see if it throws a `TypeError` to find out.

Luckily, the code I had was already splitting paths by forward slashes (`/`) because I'm lazy and it is used everywhere but Windows[^5]. So that solves one part of the problem.

Checking for empty strings, and the "`.`" and "`..`" patterns is easy as those are exact strings to check.

The problem then becomes what is covered by spec but not specified:

>  (...) Additionally underlying file systems might have further restrictions on what names are or aren’t allowed (...)

From my testing, the only weird things are strings starting in null bytes. But I've also wrote some helper functions to handle weird file names as not every OS supports all names, so it becomes important later.

### It's all helper functions...

All those things considered, and a couple hundred lines of helper functions written it ends up being very simple to manipulate your own app private and handy directory.

Now getting out of it is more interesting...

## File System _Access_ and Chrome

To read or write to the user's file system, outside of the browser sandbox, we do have the File System Access API. Unfortunately it is Chrome only[^6]

<baseline-info feature="file-system-access"></baseline-info>

It is composed of the following methods on the `window` object:

- [`showOpenfilePicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker) to get a file handle for reading, and potentially writing.
- [`showSaveFilePicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker) to get a file handle to write on.
- [`showDirectoryPicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker) for get a directory handle for reading, and potentially writing.
- [`DataTransferItem.getAsFileSystemHandle`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/getAsFileSystemHandle) to integrate with drag and drop.

All those are very easy to use and intuitive in what they do. And as with this entire API surface, if gives you a handle to the file or directory.

With that you can do pretty much the same operations you can do on the OPFS.

But you need permissions for that.

### You need permissions

As you are escaping the browser sandbox with this API, you need permissions to do things with it. Similar to notifications or geolocation.
The permissions are checked like so:

```typescript
const existingPermissions = await handle.queryPermission({ mode });
const newPermissions = await handle.requestPermission({ mode });
```

The first method, `queryPermission`, checks the existing permissions you have for the handle, and the second one `requestPermission` prompts the user for the permission.

You need to call this if the type of permission you need changes, for example, if you open a file for reading and now needs to write to that file.
Or when you start a new browser session, you need to re-request permissions for in case things have changed between sessions like a file deleted or moved.

### You need permissions 2: Button Boogaloo

The "problem" with the permissions API is that is requires [user activation](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation). It means the user has to click, touch the screen, or type any key before you can ask for permissions.
Security sometimes gets in the way of ease of use, this is one of the cases and we have to live with that.

### Persisting access

If all of that seems too much work when you can simply add a file input and the user opens it, that's because it is. The main difference is browser support and API power.

With file inputs you can't:

- Write back to the files.
- Create files in a directory.
- Delete files and directories.
- Open a file picker without an input.
- Persist access to handles.
- Persist permissions for handles.

When you need to keep access to a handle between browsing sessions, you can do so by saving the handle on IndexedDB.

But nothing is easy, so IndexedDB is an old API and doesn't understand promises. It is fairly straightforward to use though. Oh well...

## Error handling

One final detail I glossed over for all these operations is: you need to handle errors.
Here are the most relevant ones:

- `TypeError`: if the file or directory name has invalid characters.
- `NotAllowedError`: when you don't have permissions for that handle.
- `NotFoundError`: If the entry the handle refers to does not exist. Like a deleted or non existent file.

## The library

As this is not the first time I dabbled with the File System APIs, I put together a library with some operations to make life easier.
It is available on npm: [`@mad-c/file-system-helpers`](https://www.npmjs.com/package/@mad-c/file-system-helpers)

## References

Here are two references that helped me understand the API:

- [The File System Access API: simplifying access to local files](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
- [Persistent permissions for the File System Access API](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api)

[^1]: So... IDB can be a pain to deal with, and working with that meant converting between formats from and to SQLite anyways. Using a library that allows to query and manipulate an SQLite database in the browser made it easier to work with.

[^2]: There is a quotas and there are other details like [eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) to take care of, but that is beyond the scope of this post due to extra complexity.

[^3]: One type of attack is to replace the underlying file if a program only verifies the paths, so it will happily execute a malicious file.

[^4]: A little foreshadowing: when you get a handle to a directory on the user's computer, outside of the OPFS, it can be considered a file system root.

[^5]: Fun fact: Windows _canonically_ uses backslashes (`\`) for paths, but in modern versions, it will accept forward slashes (`/`) and convert them in some applications. So, yeah, they are mostly interchangeable and Windows won't complain much if you use one or the other.

[^6]: All the other browser vendors oppose to implementing this API, so yeah, this is the the really bad news.
