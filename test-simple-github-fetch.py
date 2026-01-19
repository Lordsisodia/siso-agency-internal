#!/usr/bin/env python3
"""Simple test of GitHub issue fetching"""

import asyncio
import json
import subprocess
from pathlib import Path
from datetime import datetime

async def fetch_github_issues(repo: str, state_file: Path):
    """Fetch GitHub issues using gh CLI"""

    print(f"🔍 Fetching issues from: {repo}")

    # Load state
    seen_issues = set()
    if state_file.exists():
        with open(state_file, 'r') as f:
            state_data = json.load(f)
            seen_issues = set(state_data.get('seen_issues', []))
        print(f"   → State loaded: {len(seen_issues)} previously seen issues")
    else:
        print(f"   → No state file, starting fresh")

    # Fetch issues
    try:
        result = subprocess.run(
            ['gh', 'issue', 'list', '--repo', repo, '--limit', '10',
             '--json', 'number,title,body,state,labels,createdAt,url'],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode != 0:
            print(f"   ❌ GitHub CLI failed: {result.stderr}")
            return

        issues_data = json.loads(result.stdout)
        print(f"   → Fetched {len(issues_data)} issues from GitHub")

    except Exception as e:
        print(f"   ❌ Failed to fetch: {e}")
        return

    # Filter new issues
    new_issues = [issue for issue in issues_data if issue['number'] not in seen_issues]
    print(f"   → New issues to analyze: {len(new_issues)}")

    if not new_issues:
        print("   → No new issues, all already seen")
        return

    # Build analysis
    analysis = f"# GitHub Issues Analysis: {repo}\n\n"
    analysis += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    analysis += f"## Summary\n\n"
    analysis += f"- Total fetched: {len(issues_data)}\n"
    analysis += f"- New issues: {len(new_issues)}\n"
    analysis += f"- Previously seen: {len(seen_issues)}\n\n"

    for issue in new_issues[:5]:
        analysis += f"## Issue #{issue['number']}: {issue['title']}\n\n"
        analysis += f"**State:** {issue['state']}\n"
        analysis += f"**URL:** {issue['url']}\n\n"

        body = issue.get('body', 'No description')[:200]
        if len(issue.get('body', '')) > 200:
            body += "..."
        analysis += f"### Description\n\n{body}\n\n"

        seen_issues.add(issue['number'])

    # Save to file
    output_file = Path(f".blackbox5/engine/development/framework-research/{repo.replace('/', '-')}-ANALYSIS.md")
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w') as f:
        f.write(analysis)

    print(f"   ✓ Analysis saved: {output_file}")
    print(f"   ✓ Size: {len(analysis)} characters")

    # Update state
    with open(state_file, 'w') as f:
        json.dump({
            'last_updated': datetime.now().isoformat(),
            'repo': repo,
            'seen_issues': list(seen_issues),
            'total_seen': len(seen_issues)
        }, f, indent=2)

    print(f"   ✓ State updated: {len(seen_issues)} total issues seen")

async def main():
    """Main test function"""

    print("╔════════════════════════════════════════════════════════════╗")
    print("║     Simple GitHub Fetch Test                                ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()

    state_file = Path.cwd() / '.blackbox5' / 'engine' / 'operations' / 'runtime' / 'ralph' / 'github_state.json'
    state_file.parent.mkdir(parents=True, exist_ok=True)

    # Test multiple repos
    repos = [
        'FoundationAgents/MetaGPT',
        'openai/swarm',
        'agentscope-ai/agentscope'
    ]

    for repo in repos:
        print()
        await fetch_github_issues(repo, state_file)
        await asyncio.sleep(2)

    print()
    print("✅ Test complete!")
    print()
    print("Output files:")
    output_dir = Path.cwd() / '.blackbox5' / 'engine' / 'development' / 'framework-research'
    if output_dir.exists():
        for file in output_dir.glob('*.md'):
            print(f"  • {file.name} ({file.stat().st_size} bytes)")

if __name__ == '__main__':
    asyncio.run(main())
