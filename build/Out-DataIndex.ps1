Get-ChildItem "$PSScriptRoot\..\public\_data" -Directory -Exclude @('.obsidian', 'templates') |
ForEach-Object {
	@{
		name = $_.Name
		files = Get-ChildItem $_ -Recurse -File -Filter '*.md' | ForEach-Object { $_.FullName }
	}
} |
ConvertTo-Json |
Out-File "$PSScriptRoot\..\public\_data\index.json"
