<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom" exclude-result-prefixes="atom">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
			<head>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
				<title>
					<xsl:value-of select="atom:feed/atom:title" />
				</title>

				<!-- {{CSS}} -->

				<script type="module">
					const formatter = new Intl.DateTimeFormat(navigator.language, {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric'
					});

					[...document.querySelectorAll('time')].forEach((time) => {
						const date = new Date(time.textContent);

						time.textContent = formatter.format(date);
						time.setAttribute('datetime', date.toISOString());
					});
				</script>
			</head>
			<body>
				<header id="feed-header">
					<a id="feed-image">
						<xsl:attribute name="href"><xsl:value-of select="atom:feed/atom:link[@rel='alternate']/@href"/></xsl:attribute>

						<img width="88" height="88">
							<xsl:attribute name="src"><xsl:value-of select="atom:feed/atom:logo"/></xsl:attribute>
							<xsl:choose>
								<xsl:when test="atom:feed/atom:subtitle">
									<xsl:attribute name="alt"><xsl:value-of select="atom:feed/atom:subtitle"/></xsl:attribute>
								</xsl:when>
								<xsl:when test="atom:feed/atom:title">
									<xsl:attribute name="alt"><xsl:value-of select="atom:feed/atom:title"/></xsl:attribute>
								</xsl:when>
								<xsl:otherwise>
									<xsl:attribute name="alt">No image description</xsl:attribute>
								</xsl:otherwise>
							</xsl:choose>
						</img>
					</a>

					<h1 id="feed-title">
						<a>
							<xsl:attribute name="href"><xsl:value-of select="atom:feed/atom:link[@rel='alternate']/@href"/></xsl:attribute>
							<xsl:value-of select="atom:feed/atom:title"/>
						</a>
					</h1>

					<section id="metadata">
						<span>Last updated at: <time><xsl:value-of select="atom:feed/atom:updated"/></time></span>

						<blockquote id="description">
							<small><em><xsl:value-of select="atom:feed/atom:subtitle"/></em></small>
						</blockquote>
					</section>
				</header>

				<main>
					<xsl:for-each select="atom:feed/atom:entry">
						<article class="item">
							<header>
								<h2>
									<a>
										<xsl:attribute name="href"><xsl:value-of select="atom:id"/></xsl:attribute>
										<xsl:value-of select="atom:title"/>
									</a>
								</h2>

								<aside class="item-metadata">
									<p>
										<xsl:choose>
											<xsl:when test="atom:updated">
												<span>Last updated: <time><xsl:value-of select="atom:updated"/></time></span>
											</xsl:when>
											<xsl:when test="atom:published">
												<span>Published on: <time><xsl:value-of select="atom:published"/></time></span>
											</xsl:when>
										</xsl:choose>

										<xsl:choose>
											<xsl:when test="atom:updated and atom:author">
												<span> | </span>
											</xsl:when>
											<xsl:when test="atom:published and atom:author">
												<span> | </span>
											</xsl:when>
										</xsl:choose>

										<xsl:if test="atom:author">
											<span><xsl:value-of select="atom:author"/></span>
										</xsl:if>
									</p>
								</aside>
							</header>

							<div class="item-content">
								<xsl:choose>
									<xsl:when test="atom:summary">
										<xsl:value-of select="atom:summary"/>
									</xsl:when>
									<xsl:when test="atom:content">
										<xsl:value-of disable-output-escaping="yes" select="atom:content"/>
									</xsl:when>
									<xsl:otherwise>
										<p>No content</p>
									</xsl:otherwise>
								</xsl:choose>

								<p><a><xsl:attribute name="href"><xsl:value-of select="atom:id"/></xsl:attribute>Read more...</a></p>
							</div>
						</article>

						<footer>
							<xsl:if test="atom:category">
								<details>
									<summary>Post Tags</summary>
									<ul>
										<xsl:for-each select="atom:category">
											<li class="tag">
												<xsl:value-of select="/@term"/>
											</li>
										</xsl:for-each>
									</ul>
								</details>
							</xsl:if>
						</footer>
					</xsl:for-each>
				</main>

				<a href="http://validator.w3.org/feed/check.cgi?url="><img src="valid-atom.png" alt="[Valid Atom 1.0]" title="Validate my Atom 1.0 feed" /></a>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
