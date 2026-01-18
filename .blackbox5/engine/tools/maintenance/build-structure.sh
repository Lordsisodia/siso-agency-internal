#!/usr/bin/env bash
# Build complete .blackbox4 directory structure

set -euo pipefail

echo "🏗️  Building .blackbox4 directory structure..."
echo ""

# Create dot-folder subdirectories
echo "📁 Creating dot-folder subdirectories..."

mkdir -p .config
mkdir -p .docs/{1-getting-started,2-reference,3-components,4-frameworks,5-workflows,6-archives}
mkdir -p .memory/{working,extended,archival}
mkdir -p .memory/working/compact
mkdir -p .memory/extended/{chroma-db,entities}
mkdir -p .memory/archival/{sessions,projects}
mkdir -p .plans/{_template,active}
mkdir -p .plans/_template/artifacts
mkdir -p .runtime/{.ralph,cache,locks,state}
mkdir -p .runtime/.ralph/logs

echo "✅ Dot-folders created"

# Create agents subdirectories
echo "📁 Creating agents subdirectories..."

mkdir -p 1-agents/{1-core,2-bmad,3-research,4-specialists,5-enhanced}
mkdir -p 1-agents/1-core/templates
mkdir -p 1-agents/2-bmad/{core,modules,workflows}
mkdir -p 1-agents/3-research/{deep-research,feature-research,oss-discovery,docs-feedback}
mkdir -p 1-agents/3-research/deep-research/{schemas,examples,prompts/library}
mkdir -p 1-agents/3-research/oss-discovery/{schemas,oss-discovery-sidecar}
mkdir -p 1-agents/3-research/docs-feedback/modules
mkdir -p 1-agents/4-specialists/{orchestrator,architect,ralph-agent}
mkdir -p 1-agents/4-specialists/ralph-agent/{work,context}
mkdir -p 1-agents/.skills/{1-core,2-mcp,3-workflow}

echo "✅ Agents subdirectories created"

# Create frameworks subdirectories
echo "📁 Creating frameworks subdirectories..."

mkdir -p 2-frameworks/{1-bmad,2-speckit,3-metagpt,4-swarm}
mkdir -p 2-frameworks/1-bmad/{workflows,agents}
mkdir -p 2-frameworks/2-speckit/{slash-commands,templates}
mkdir -p 2-frameworks/3-metagpt/templates
mkdir -p 2-frameworks/4-swarm/{patterns,examples}

echo "✅ Frameworks subdirectories created"

# Create modules subdirectories
echo "📁 Creating modules subdirectories..."

mkdir -p 3-modules/{context,domain,first-principles,implementation,kanban,planning,research}

echo "✅ Modules subdirectories created"

# Create scripts subdirectories
echo "📁 Creating scripts subdirectories..."

mkdir -p 4-4-scripts/python

echo "✅ Scripts subdirectories created"

# Create templates subdirectories
echo "📁 Creating templates subdirectories..."

mkdir -p 5-templates/{1-documents,2-plans,3-code}

echo "✅ Templates subdirectories created"

# Create tools subdirectories
echo "📁 Creating tools subdirectories..."

mkdir -p 6-tools/{validation,migration,maintenance}

echo "✅ Tools subdirectories created"

# Create workspace subdirectories
echo "📁 Creating workspace subdirectories..."

mkdir -p 7-workspace/{artifacts,benchmarks,projects,runs}

echo "✅ Workspace subdirectories created"

echo ""
echo "🎉 .blackbox4 directory structure complete!"
echo ""
echo "📊 Structure summary:"
echo "   - 5 dot-folders (.config, .docs, .memory, .plans, .runtime)"
echo "   - 7 numbered folders (1-agents through 7-workspace)"
echo "   - Complete 5-level deep hierarchy"
