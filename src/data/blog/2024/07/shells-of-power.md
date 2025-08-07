---
title: The Shells of Power
summary: One shell to sudo them all, One shell to grep them, One shell to fork and in vt-100 display them
image: ./assets/ring-of-power.jpg
imageAlt: A low poly silver ring, burning with a volcano behind it. This image is inside an old TV set made up of a green wire mesh.
createdAt: 2024-07-25T17:46:16
tags:
  - coding
  - personal
  - protip
---

Let's talk about PowerShell...

The other day during an event people asked me why I like PowerShell so much to the point of having it installed on a Mac, tainting a perfect operating system with the shadow of evil. [\[cue Lord of The Rings theme for the one ring\]](https://www.youtube.com/watch?v=Dw6BCAZqkaQ)

## Three shells for the kings on all PCs

The default shells for the main OSes: [bash](https://www.gnu.org/software/bash/), [zsh](https://www.zsh.org/) and [cmd](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/cmd) are pretty basic. They get the job done.

The problem is they are bound by supporting legacy features and weird syntax. Did you know that "`[`" _is a command_?

By being built on top of the [.net framework](https://dotnet.microsoft.com/en-us/), PowerShell uses a syntax similar to [C#](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/overview).

## Seven objects and their halls of pipes

The thing that makes PowerShell stand out to me is that everything is objects, when we pipe one command to the other, it is _objects_! There is no need to do some `grep` magic and try to parse strings around when you are looking for something.

In my previous job, a common case was:

> From this nested directory tree, containing CSV files at the end. Find all files that have value "X" on column "Y" and value "Z" on column "W"

This would be a nightmare to do in bash, but in PowerShell it is just like the following:

```powershell
# Get all CSV files inside the current directory
Get-ChildItem '*.csv' -Recurse -File |
# Filter the objects
Where-Object {
	# Read the file and convert from CSV to an object
	# "$_" reffers to the current item on the loop
	Get-Content $_ | ConvertFrom-Csv |
	Where-Object {
		# Test if the columns have the values we are looking for
		# If there is any result of "true", it will bubble up
		($_.X -eq 'Y') -and ($_.Z -eq 'W')
	}
}
```

There are idiosyncrasies here as well, it is not a perfect tool. But for me it feels more intuitive and easier to write than bash. And anything using cmd is awful, so let's skip that comparison.

## Nine for the verbs, approved by committee

It may be a little bit controversial, but I like the "`Verb-Noum`" syntax. It gives me some easy rule to manage the myriad of potential commands.

The docs about it are here: https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/approved-verbs-for-windows-powershell-commands?view=powershell-7.4

## One for the DevOps in their server rooms

If you, like me, _actually like_ using Windows, than that is the best choice. Specially for more advanced commands and configurations.

I learned it a few years back because I am on the Windows Insider program, so my OS updates quite frequently and total resets are common.

To make my life less painful, I started to write a series of scripts to configure my PC. The hurdles with cmd made me look for alternatives and I stumbled on PowerShell.
It was easier to write and more powerful, was love at first `exitcode 0`!

## In the land of git where Open Source lies

It is interesting seeing how one shell influences another. My favorite feature of [fish](https://fishshell.com/) is inline auto completions. That has been added to PowerShell.

Another not so well known shell, [nushell](https://www.nushell.sh/), has the same idea of piping objects as PowerShell does.

The future is interesting and using the terminal is cool again! Heck, it even have emojis everywhere!
