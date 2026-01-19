#!/usr/bin/env python3
"""
Autonomous Framework Research - Continuous Loop
Runs for 20 minutes researching frameworks
"""

import asyncio
import json
import subprocess
from pathlib import Path
from datetime import datetime
import time

# Configuration
WORKSPACE = Path.cwd()
STATE_FILE = WORKSPACE / '.blackbox5' / 'engine' / 'operations' / 'runtime' / 'ralph' / 'github_state.json'
OUTPUT_DIR = WORKSPACE / '.blackbox5' / 'engine' / 'development' / 'framework-research'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TEST_DURATION_MINUTES = 20
CHECK_INTERVAL_SECONDS = 30

# Frameworks to research
FRAMEWORKS = [
    {'repo': 'FoundationAgents/MetaGPT', 'name': 'MetaGPT', 'focus': 'metagpt'},
    {'repo': 'openai/swarm', 'name': 'Swarm', 'focus': 'swarm'},
    {'repo': 'agentscope-ai/agentscope', 'name': 'AgentScope', 'focus': 'agentscope'},
    {'repo': 'microsoft/agent-framework', 'name': 'Microsoft Agent Framework', 'focus': 'microsoft'},
    {'repo': 'google/adk-python', 'name': 'Google ADK', 'focus': 'google-adk'},
    {'repo': 'MervinPraison/PraisonAI', 'name': 'PraisonAI', 'focus': 'praisonai'},
    {'repo': 'bytedance/deer-flow', 'name': 'DeerFlow', 'focus': 'deerflow'},
    {'repo': 'ruvnet/claude-flow', 'name': 'Claude Flow', 'focus': 'claude-flow'},
    {'repo': 'iflytek/astron-agent', 'name': 'Astron Agent', 'focus': 'astron'},
    {'repo': 'bmad-code-org/BMAD-METHOD', 'name': 'BMAD', 'focus': 'bmad'},
]

async def fetch_github_issues(framework, state_data):
    """Fetch GitHub issues for a framework"""

    repo = framework['repo']
    name = framework['name']
    focus = framework['focus']

    print(f"\n🔍 [{name}] Fetching issues from: {repo}")

    # Get seen issues for this repo
    seen_issues = set(state_data.get('repos', {}).get(repo, []))
    print(f"   → Previously seen: {len(seen_issues)} issues")

    try:
        # Fetch issues using GitHub CLI
        result = subprocess.run(
            ['gh', 'issue', 'list', '--repo', repo, '--limit', '20',
             '--json', 'number,title,body,state,labels,createdAt,url'],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode != 0:
            print(f"   ❌ GitHub CLI failed: {result.stderr[:100]}")
            return False

        issues_data = json.loads(result.stdout)
        print(f"   → Fetched: {len(issues_data)} issues")

    except subprocess.TimeoutExpired:
        print(f"   ❌ Timeout fetching issues")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

    # Filter to new issues
    new_issues = [issue for issue in issues_data if issue['number'] not in seen_issues]
    print(f"   → New issues: {len(new_issues)}")

    if not new_issues:
        print(f"   ✓ All issues already seen")
        return True

    # Build analysis
    analysis = f"# GitHub Issues Analysis: {name}\n\n"
    analysis += f"**Repository:** {repo}\n"
    analysis += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    analysis += f"**Focus Area:** {focus}\n\n"
    analysis += f"## Summary\n\n"
    analysis += f"- **Total issues fetched:** {len(issues_data)}\n"
    analysis += f"- **New issues analyzed:** {len(new_issues)}\n"
    analysis += f"- **Previously seen:** {len(seen_issues)}\n\n"

    # Analyze each new issue
    for issue in new_issues[:10]:
        analysis += f"## Issue #{issue['number']}: {issue['title']}\n\n"
        analysis += f"**State:** {issue['state']}\n"
        analysis += f"**Created:** {issue['createdAt']}\n"
        analysis += f"**URL:** {issue['url']}\n\n"

        if issue.get('labels'):
            labels = ', '.join([l['name'] for l in issue['labels']])
            analysis += f"**Labels:** {labels}\n\n"

        # Truncate body
        body = issue.get('body', 'No description')
        if len(body) > 300:
            body = body[:300] + "..."
        analysis += f"### Description\n\n{body}\n\n"

        # Basic analysis
        analysis += f"### Analysis\n\n"
        analysis += f"This issue relates to {focus}. "

        # Categorize issue
        title_lower = issue['title'].lower()
        body_lower = (issue.get('body', '') or '').lower()

        if any(word in title_lower or word in body_lower for word in ['bug', 'error', 'fail', 'crash', 'broken']):
            analysis += "Appears to be a **bug report** or **error**. "
        elif any(word in title_lower or word in body_lower for word in ['install', 'setup', 'config', 'dependency']):
            analysis += "Related to **installation** or **setup**. "
        elif any(word in title_lower or word in body_lower for word in ['document', 'doc', 'readme', 'example']):
            analysis += "Related to **documentation**. "
        elif any(word in title_lower or word in body_lower for word in ['feature', 'request', 'add', 'support']):
            analysis += "Appears to be a **feature request**. "

        analysis += f"Impact assessment needed based on labels and community engagement.\n\n"

        # Mark as seen
        seen_issues.add(issue['number'])

    # Add recommendations
    analysis += f"## Recommendations\n\n"
    analysis += f"- Review {len(new_issues)} new issues above\n"
    analysis += f"- Prioritize based on labels and community response\n"
    analysis += f"- Consider backlog items for high-priority patterns\n\n"

    # Save analysis
    safe_name = repo.replace('/', '-')
    output_file = OUTPUT_DIR / f"{safe_name}-ANALYSIS.md"

    with open(output_file, 'w') as f:
        f.write(analysis)

    print(f"   ✓ Saved: {output_file.name} ({len(analysis)} chars)")

    # Update state
    if 'repos' not in state_data:
        state_data['repos'] = {}
    state_data['repos'][repo] = list(seen_issues)
    state_data['last_updated'] = datetime.now().isoformat()
    state_data['total_issues'] = sum(len(v) for v in state_data['repos'].values())

    return True

async def research_cycle(state_data, cycle_num):
    """Run one research cycle through all frameworks"""

    print(f"\n{'='*70}")
    print(f" CYCLE {cycle_num}")
    print(f"{'='*70}")
    print(f"Time: {datetime.now().strftime('%H:%M:%S')}")

    success_count = 0
    for framework in FRAMEWORKS:
        try:
            success = await fetch_github_issues(framework, state_data)
            if success:
                success_count += 1
            await asyncio.sleep(1)  # Small delay between repos
        except Exception as e:
            print(f"   ❌ Error processing {framework['name']}: {e}")

    print(f"\n✓ Cycle {cycle_num} complete: {success_count}/{len(FRAMEWORKS)} frameworks updated")

async def main():
    """Main autonomous research loop"""

    print("╔════════════════════════════════════════════════════════════╗")
    print("║     Autonomous Framework Research (20-minute test)          ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print("")
    print(f"Test Duration: {TEST_DURATION_MINUTES} minutes")
    print(f"Check Interval: {CHECK_INTERVAL_SECONDS} seconds")
    print(f"Frameworks: {len(FRAMEWORKS)}")
    print(f"Output Directory: {OUTPUT_DIR}")
    print("")

    # Load or initialize state
    state_data = {}
    if STATE_FILE.exists():
        with open(STATE_FILE, 'r') as f:
            state_data = json.load(f)
        print(f"Loaded existing state: {state_data.get('total_issues', 0)} issues seen")
    else:
        print("Starting fresh (no existing state)")

    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

    # Calculate end time
    start_time = time.time()
    end_time = start_time + (TEST_DURATION_MINUTES * 60)

    print(f"\nStarting autonomous research...")
    print(f"Will run until: {datetime.fromtimestamp(end_time).strftime('%H:%M:%S')}")
    print("")

    cycle = 0
    while time.time() < end_time:
        cycle += 1

        try:
            await research_cycle(state_data, cycle)

            # Save state after each cycle
            with open(STATE_FILE, 'w') as f:
                json.dump(state_data, f, indent=2)

            # Show summary
            print(f"\n📊 Progress Summary:")
            print(f"   Cycles completed: {cycle}")
            print(f"   Total issues seen: {state_data.get('total_issues', 0)}")
            print(f"   Time remaining: {int((end_time - time.time()) / 60)} minutes")

            # Check if we should continue
            time_remaining = end_time - time.time()
            if time_remaining <= CHECK_INTERVAL_SECONDS:
                print(f"\n⏱️  Test duration reached, stopping...")
                break

            print(f"\n⏳ Waiting {CHECK_INTERVAL_SECONDS}s until next cycle...")
            print(f"{'='*70}\n")

            await asyncio.sleep(CHECK_INTERVAL_SECONDS)

        except KeyboardInterrupt:
            print("\n\n⚠️  Test interrupted by user")
            break
        except Exception as e:
            print(f"\n❌ Error in cycle: {e}")
            await asyncio.sleep(5)

    # Final summary
    print("\n" + "="*70)
    print(" TEST COMPLETE")
    print("="*70)
    print(f"\nTotal Cycles: {cycle}")
    print(f"Total Issues Seen: {state_data.get('total_issues', 0)}")
    print(f"Duration: {int((time.time() - start_time) / 60)} minutes")
    print(f"\nOutput files in: {OUTPUT_DIR}")

    # List output files
    output_files = list(OUTPUT_DIR.glob('*.md'))
    print(f"\nGenerated {len(output_files)} analysis files:")
    for f in sorted(output_files):
        size = f.stat().st_size
        mtime = datetime.fromtimestamp(f.stat().st_mtime).strftime('%H:%M:%S')
        print(f"  • {f.name} ({size} bytes, updated {mtime})")

    print("\n✅ Autonomous research test complete!")
    print("")

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test stopped by user")
