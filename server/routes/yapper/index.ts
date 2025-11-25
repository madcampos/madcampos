import data from './data.json' with { type: 'json' };

export function yapper() {
	// TODO: select one id and put all other as links

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
				<strong>
					If you are a human and got into this maze, please feel free to leave it.<br />
					This is just a random page to keep naughty and unrespectful machines busy.
				</strong>
			</aside>
			<h1></h1>
			<p></p>
			<nav>
				<ul>
					<!-- TODO: links -->
				</ul>
			</nav>
		</body>
	</html>
	`;

	return new Response();
}
