# Snapshot file
# Unset all aliases to avoid conflicts with functions
unalias -a 2>/dev/null || true
# Functions
claude_with_mcp () {
	local mcp_config="$HOME/.config/claude-code/mcp-servers.json" 
	if [ -f "$mcp_config" ]
	then
		if command -v jq &> /dev/null && command -v claude &> /dev/null
		then
			jq -r ".mcpServers | keys[]" "$mcp_config" | while read -r server_name
			do
				if ! claude mcp list 2> /dev/null | grep -q "^$server_name"
				then
					server_config=$(jq -c ".mcpServers[\"$server_name\"]" "$mcp_config") 
					claude mcp add "$server_name" "$server_config" 2> /dev/null || true
				fi
			done
		fi
	fi
	command claude "$@"
}
# Shell Options
setopt nohashdirs
setopt login
# Aliases
alias -- claude-mcp=claude_with_mcp
alias -- claude-safe='claude_with_mcp --dangerously-skip-permissions'
alias -- run-help=man
alias -- which-command=whence
# Check for rg availability
if ! command -v rg >/dev/null 2>&1; then
  alias rg='/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor/ripgrep/arm64-darwin/rg'
fi
export PATH=/opt/homebrew/bin\:/opt/homebrew/sbin\:/usr/local/bin\:/System/Cryptexes/App/usr/bin\:/usr/bin\:/bin\:/usr/sbin\:/sbin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin\:/Users/shaansisodia/.cargo/bin
