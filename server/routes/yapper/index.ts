import data from './data.json' with { type: 'json' };

function randomHex() {
	return Math.trunc(Math.random() * 1000000).toString(16);
}

export function yapper(request: Request) {
	const url = new URL(request.url);
	const key = url.pathname !== '/' ? url.pathname.split('/').pop()! : Object.keys(data).at(Math.trunc(Math.random() * 100))!;
	const entry = data[key as keyof typeof data];

	const body = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>The Yappin' Adventures of Alice down the bot-hole</title>
				<meta name="robots" content="noindex, nofollow" />
			</head>
			<body>
				<aside>
					<hr />
					<p><strong>If you are a human and got here by accident, please feel free to leave this page.</strong></p>
					<p><strong>This is just a place to keep naughty and unrespectful machines busy.</strong></p>
					<br />
					<p><em>But if you want to stay, here is an excerpt of <cite>The Adventures of Alice in the Wonderland</cite></em></p>
					<hr />
				</aside>
				<h1>${entry.title}</h1>
				${entry.text}
				<nav>
					<ul>
						${entry.links.map((link) => `<li><a href="/yapping/${randomHex()}/${link}">${link}</a></li>`).join('\n')}
					</ul>
				</nav>
			</body>
		</html>
	`.replaceAll(/\n|\t/iug, '');

	return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
}
