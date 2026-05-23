---
title: The File System and You
summary: The tricky parts of working with the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
createdAt: 2026-05-13T22:01:55.705-04:00
draft: true
tags:
  - HTML
  - JavaScript
  - Web Development
  - Building in Public
---

Yet another time I stand in front of a problem that needs to read files from the user device. Furthermore, read _and_ keep a reference to files from the user device.

There are two parts to this story, one with broad browser support, and another that is Chrome Only™.

## The problem

I was working on an application that two things: a directory with images, and an SQLite database with metadata about those images.
The application _viewing_ logic itself was simple, it queried the database for some properties and then displayed images accordingly.

Then there was the application _editing_ logic, that one, was not so simple. In short, a user could crop the images and update the metadata on the database.
On the surface, it is all nice and doable from a browser, thanks in part to the amazing [`sql.js`](https://sql.js.org/#/) library that allows to query an SQLite database and avoid the wonders of [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)[^1].

But then... How do I _save_ the database and the files? Specifically, how do I save the files without _asking for the user to download them every single time_?

## File System API and OPFS

This is the good is all modern browsers support the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) and [Origin Private File Systems (OPFS)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system). Those APIs provide two things:

- The API: An abstraction over files, directories, and handles for those.
- OPFS: A directory that the application has access to and can use however it sees fit.[^2]

The OPFS is easy, you call one method and it gives you what you need:

```typescript
const opfs = await navigator.storage.getDirectory();
```

Then you use the File System API to read and write files and directories.

### No paths, only handles

The first oddity is that you don't deal with _paths_ to things, you deal with _handles_. It is similar, if working with node or Linux to use file descriptors for everything.

It is a good idea to use handles instead of paths due to security. If the file is moved in the OS, a link is changed, or any other thing happens and the path does not match the file anymore[^3], you still hold a reference to the file itself.

[Path traversal attacks](https://owasp.org/www-community/attacks/Path_Traversal) and [path normalization](https://superuser.com/questions/176388/why-does-windows-use-backslashes-for-paths-and-unix-forward-slashes) are also avoided.

But then how do you handle nested files and directories when working with the directory tree?

### Recreating basic utilities

Yes, that is the painful part, you have to recreate some utilities like `mkdir` or `rm` yourself. As well as some path to handle resolutions...

The bad news is that walking "forwards" on a tree to create entries that don't exist yet like with `mkdir -p` has to be done manually.

The good news is that from a base directory you can basically call [`resolve()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/resolve) on other handles and it will give you an array of names in between the two.
So it covers the walking "backwards" case from a random entry to the root of the file system.

For general path resolution, although re-creating those functions can be tedious, the node.js [path module](https://nodejs.org/docs/latest/api/path.html) is a good inspiration.

### Naming things is hell

Then comes one of the best problems in computer science: naming things.

Specifically, [what is and is not allowed in the names of files](https://fs.spec.whatwg.org/#valid-file-name). Unfortunately for us, the specification leaves it open for interpretation... Got to love those "undefined behaviours"...

Anyways, the very basics are covered:

- File name can't be an empty string
- File name can't be "`.`" or "`..`"
- File name can be a path separator ("`/`" or "`\`")

Anything else you have to throw a `TypeError` to find out.

### Helper functions to the rescue

All those things considered, and a couple hundred lines of helper functions written it ends up being very simple to manipulate your own app private and handy directory.

Now getting out of it is more interesting...

## File System _Access_ and Chrome

To read or write to the user's file system, outside of the browser sandbox, we do have the File System Access API. It is composed of the following methods on the `window` object:

- [`showOpenfilePicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker) to get a file handle for reading, and potentially writing.
- [`showSaveFilePicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker) to get a file handle to write on.
- [`showDirectoryPicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker) for get a directory handle for reading, and potentially writing.
- [`DataTransferItem.getAsFileSystemHandle`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/getAsFileSystemHandle) to integrate with drag and drop.

All those are very easy to use and intuitive in what they do. And as with this entire API, if gives you a handle to the file or directory.
With that you can do pretty much the same you can do on the OPFS.

### You need permissions

The caveat, and that is a big one, is that to access the file itself you need permissions, that is checked like so:

```typescript
const existingPermissions = await handle.queryPermission({ mode });
const newPermissions = await handle.requestPermission({ mode });
```

The first method, `queryPermission`, checks the existing permissions you have for the handle, and the second one `requestPermission` prompts the user for the permission.

You need to call this if the type of permission you need changes, for example, if you open a file for reading and now needs to write to that file.

### You need permissions 2: Button Boogaloo

The "problem" with the permissions API is that is requires [user activation](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation). It means the user has to click or type any key before you can ask for permissions.
Security sometimes gets in the way of ease of use, this is one of the cases and we have to live with that.

### Persisting access

If all of that seems too much work when you can simply add a file input and the user opens it, that's because it is. For when you don't need persistent access and when you don't need to write a whole directory, that is.

When you need to keep that handle and access it at a later time when the user visits your application, you can do so by simply saving the handle on IndexedDB.

To make life less miserable I've used the wonderful [`idb`](https://github.com/jakearchibald/idb) library. It is just a thin wrapper over IndexedDB to handle most of the scaffolding for you.

The reasons for persisting access are:

- Once you have a handle persisted your application can reuse that handle.
- Once you get permissions, the permissions stick so you don't need to re-ask for them.

## Putting the access together

Here is a high level sequence of what to do:

1. Application loads
2. If a handle is saved on IndexedDB
   1. If permissions are wrong, show a "permission info" screen with a button to request the correct permissions
3. If no handle is saved, show screen for selecting the files

Pretty simple right?

## Error handling

One part I glossed over is that for all these operations, you need to handle errors.
The most relevant are:

- `TypeError`: if the file or directory name has invalid characters.
- `NotAllowedError`: when you don't have permissions for that handle.
- `NotFoundError`: If the entry the handle refers to does not exist.

## The library

As this is not the first time I dabbled with the File System APIs, I put together a library with some operations to make life easier.

[^1]: So... IDB can be a pain to deal with, and working with that meant converting between formats from and to SQLite anyways. Using a library that allows to query and manipulate an SQLite database in the browser made it easier to work with.

[^2]: There is a quotas and there are other details like [eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) to take care of, but that is beyond the scope of this post due to extra complexity.

[^3]: One type of attack is to replace the underlying file if a program only verifies the paths, so it will happily execute a malicious file.
