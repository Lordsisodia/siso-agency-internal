# Snapshot file
# Unset all aliases to avoid conflicts with functions
unalias -a 2>/dev/null || true
# Functions
claude-tokens () {
	local stats=$(curl -s http://localhost:8080/api/stats 2>/dev/null) 
	if [ $? -eq 0 ]
	then
		echo "📊 Claude Token Usage:"
		echo "$stats" | jq -r '"Total: \(.total_tokens // 0) tokens ($\(.total_cost // 0))"'
		echo "$stats" | jq -r '"Today: \(.today_tokens // 0) tokens ($\(.today_cost // 0))"'
	else
		echo "❌ ClaudeLens not running. Start with: claudelens-start"
	fi
}
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
compaudit () {
	# undefined
	builtin autoload -XUz /usr/share/zsh/5.9/functions
}
compdef () {
	local opt autol type func delete eval new i ret=0 cmd svc 
	local -a match mbegin mend
	emulate -L zsh
	setopt extendedglob
	if (( ! $# ))
	then
		print -u2 "$0: I need arguments"
		return 1
	fi
	while getopts "anpPkKde" opt
	do
		case "$opt" in
			(a) autol=yes  ;;
			(n) new=yes  ;;
			([pPkK]) if [[ -n "$type" ]]
				then
					print -u2 "$0: type already set to $type"
					return 1
				fi
				if [[ "$opt" = p ]]
				then
					type=pattern 
				elif [[ "$opt" = P ]]
				then
					type=postpattern 
				elif [[ "$opt" = K ]]
				then
					type=widgetkey 
				else
					type=key 
				fi ;;
			(d) delete=yes  ;;
			(e) eval=yes  ;;
		esac
	done
	shift OPTIND-1
	if (( ! $# ))
	then
		print -u2 "$0: I need arguments"
		return 1
	fi
	if [[ -z "$delete" ]]
	then
		if [[ -z "$eval" ]] && [[ "$1" = *\=* ]]
		then
			while (( $# ))
			do
				if [[ "$1" = *\=* ]]
				then
					cmd="${1%%\=*}" 
					svc="${1#*\=}" 
					func="$_comps[${_services[(r)$svc]:-$svc}]" 
					[[ -n ${_services[$svc]} ]] && svc=${_services[$svc]} 
					[[ -z "$func" ]] && func="${${_patcomps[(K)$svc][1]}:-${_postpatcomps[(K)$svc][1]}}" 
					if [[ -n "$func" ]]
					then
						_comps[$cmd]="$func" 
						_services[$cmd]="$svc" 
					else
						print -u2 "$0: unknown command or service: $svc"
						ret=1 
					fi
				else
					print -u2 "$0: invalid argument: $1"
					ret=1 
				fi
				shift
			done
			return ret
		fi
		func="$1" 
		[[ -n "$autol" ]] && autoload -rUz "$func"
		shift
		case "$type" in
			(widgetkey) while [[ -n $1 ]]
				do
					if [[ $# -lt 3 ]]
					then
						print -u2 "$0: compdef -K requires <widget> <comp-widget> <key>"
						return 1
					fi
					[[ $1 = _* ]] || 1="_$1" 
					[[ $2 = .* ]] || 2=".$2" 
					[[ $2 = .menu-select ]] && zmodload -i zsh/complist
					zle -C "$1" "$2" "$func"
					if [[ -n $new ]]
					then
						bindkey "$3" | IFS=$' \t' read -A opt
						[[ $opt[-1] = undefined-key ]] && bindkey "$3" "$1"
					else
						bindkey "$3" "$1"
					fi
					shift 3
				done ;;
			(key) if [[ $# -lt 2 ]]
				then
					print -u2 "$0: missing keys"
					return 1
				fi
				if [[ $1 = .* ]]
				then
					[[ $1 = .menu-select ]] && zmodload -i zsh/complist
					zle -C "$func" "$1" "$func"
				else
					[[ $1 = menu-select ]] && zmodload -i zsh/complist
					zle -C "$func" ".$1" "$func"
				fi
				shift
				for i
				do
					if [[ -n $new ]]
					then
						bindkey "$i" | IFS=$' \t' read -A opt
						[[ $opt[-1] = undefined-key ]] || continue
					fi
					bindkey "$i" "$func"
				done ;;
			(*) while (( $# ))
				do
					if [[ "$1" = -N ]]
					then
						type=normal 
					elif [[ "$1" = -p ]]
					then
						type=pattern 
					elif [[ "$1" = -P ]]
					then
						type=postpattern 
					else
						case "$type" in
							(pattern) if [[ $1 = (#b)(*)=(*) ]]
								then
									_patcomps[$match[1]]="=$match[2]=$func" 
								else
									_patcomps[$1]="$func" 
								fi ;;
							(postpattern) if [[ $1 = (#b)(*)=(*) ]]
								then
									_postpatcomps[$match[1]]="=$match[2]=$func" 
								else
									_postpatcomps[$1]="$func" 
								fi ;;
							(*) if [[ "$1" = *\=* ]]
								then
									cmd="${1%%\=*}" 
									svc=yes 
								else
									cmd="$1" 
									svc= 
								fi
								if [[ -z "$new" || -z "${_comps[$1]}" ]]
								then
									_comps[$cmd]="$func" 
									[[ -n "$svc" ]] && _services[$cmd]="${1#*\=}" 
								fi ;;
						esac
					fi
					shift
				done ;;
		esac
	else
		case "$type" in
			(pattern) unset "_patcomps[$^@]" ;;
			(postpattern) unset "_postpatcomps[$^@]" ;;
			(key) print -u2 "$0: cannot restore key bindings"
				return 1 ;;
			(*) unset "_comps[$^@]" ;;
		esac
	fi
}
compdump () {
	# undefined
	builtin autoload -XUz /usr/share/zsh/5.9/functions
}
compinit () {
	# undefined
	builtin autoload -XUz /usr/share/zsh/5.9/functions
}
compinstall () {
	# undefined
	builtin autoload -XUz /usr/share/zsh/5.9/functions
}
getent () {
	if [[ $1 = hosts ]]
	then
		sed 's/#.*//' /etc/$1 | grep -w $2
	elif [[ $2 = <-> ]]
	then
		grep ":$2:[^:]*$" /etc/$1
	else
		grep "^$2:" /etc/$1
	fi
}
# Shell Options
setopt nohashdirs
setopt login
# Aliases
alias -- cc=claude-colorized
alias -- cc-router-logs='tail -f ~/.claude-code-router/claude-code-router.log'
alias -- cc-router-stats='claude-code-router stats'
alias -- cc-start-router=claude-code-router
alias -- ccr-enhanced=ccr-enhanced-status
alias -- claude-cost='curl -s http://localhost:8080/api/cost | jq .'
alias -- claude-dashboard='open http://localhost:8080'
alias -- claude-logs='tail -f ~/Library/Logs/claudelens*.log'
alias -- claude-mcp=claude_with_mcp
alias -- claude-monitor='python3 /Users/shaansisodia/Desktop/Cursor/claude-improvement/claude-flow-integration/simple-working-monitor.py'
alias -- claude-safe='claude_with_mcp --dangerously-skip-permissions'
alias -- claude-search='function _cs() { curl -s "http://localhost:8080/api/search?q=$1" | jq .; }; _cs'
alias -- claude-stats='curl -s http://localhost:8080/api/stats | jq .'
alias -- claude-watch='python3 /Users/shaansisodia/Desktop/Cursor/claude-improvement/claude-flow-integration/simple-working-monitor.py watch'
alias -- claudec=claude-colorized
alias -- claudelens-restart='claudelens-stop && sleep 2 && claudelens-start'
alias -- claudelens-start=/Users/shaansisodia/Desktop/Cursor/claude-improvement/tools/claudelens/start-claudelens.sh
alias -- claudelens-stop='$CLAUDE_DIR/claude-flow-integration/claudelens-always-on.sh stop'
alias -- codellama='ollama run codellama:34b'
alias -- cv=claude-visual
alias -- deepseek='ollama run deepseek-coder-v2:16b'
alias -- fm-keys=setup-free-api-keys
alias -- fm-optimize=optimize-free-usage
alias -- fm-status=free-models-status
alias -- fm-test=test-free-models
alias -- mcp-logs='mcp-hub-control logs'
alias -- mcp-restart='mcp-hub-control restart'
alias -- mcp-start='mcp-hub-control start'
alias -- mcp-status='mcp-hub-control status'
alias -- mcp-stop='mcp-hub-control stop'
alias -- mcp-test='mcp-hub-control test'
alias -- qwen='ollama run qwen2.5-coder:7b'
alias -- qwen32='ollama run qwen2.5-coder:32b'
alias -- router-logs='tail -f ~/.claude-code-router/claude-code-router.log'
alias -- router-status='ccr status'
alias -- router-ui='ccr ui'
alias -- run-help=man
alias -- siso=/Users/shaansisodia/.local/bin/siso-enhanced
alias -- start-claude-router=start-claude-router
alias -- start-router='ccr start'
alias -- stop-claude-router=stop-claude-router
alias -- stop-router='ccr stop'
alias -- switch-claude='/model anthropic,claude-3-5-sonnet-20241022'
alias -- switch-claude-fast='/model anthropic,claude-3-5-haiku-20241022'
alias -- switch-claude-opus='/model anthropic,claude-3-opus-20240229'
alias -- switch-coding='/model scaleway,llama-3.1-70b-instruct'
alias -- switch-fast='/model groq,llama-3.1-8b-instant'
alias -- switch-powerful='/model cerebras,llama3.1-70b'
alias -- switch-unlimited='/model google,gemini-2.0-flash'
alias -- watch-switching=watch-auto-switching
alias -- which-command=whence
# Check for rg availability
if ! command -v rg >/dev/null 2>&1; then
  alias rg='/Users/shaansisodia/.bun/install/global/node_modules/\@anthropic-ai/claude-code/vendor/ripgrep/arm64-darwin/rg'
fi
export PATH=/Users/shaansisodia/.opencode/bin\:/Users/shaansisodia/.local/bin\:/Users/shaansisodia/.bun/bin\:/opt/homebrew/bin\:/opt/homebrew/sbin\:/usr/local/bin\:/System/Cryptexes/App/usr/bin\:/usr/bin\:/bin\:/usr/sbin\:/sbin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin\:/Users/shaansisodia/.local/bin\:/Users/shaansisodia/.bun/bin\:/Users/shaansisodia/.cargo/bin
