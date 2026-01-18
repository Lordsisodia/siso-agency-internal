#!/usr/bin/env node

/**
 * SISO Internal Documentation Index Generator
 *
 * Scans .docs/ directory for markdown files, extracts frontmatter and links,
 * and generates an index.json file for AI agent consumption.
 *
 * Usage: node scripts/generate-docs-index.js
 * Output: .docs/index.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DOCS_DIR = path.join(__dirname, '..', '.docs');
const OUTPUT_FILE = path.join(DOCS_DIR, 'index.json');
const EXCLUDE_DIRS = ['.git', 'node_modules', 'archive', '09-archive'];

/**
 * Parse YAML frontmatter from markdown content
 * @param {string} content - File content
 * @returns {Object} - Parsed frontmatter and content
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content };
  }

  const yamlRaw = match[1];
  const body = match[2];
  const frontmatter = {};

  // Simple YAML parser for our use case
  const lines = yamlRaw.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Parse array values
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
          .filter((v) => v.length > 0);
      }
      // Remove quotes from string values
      else if (value.startsWith('"') || value.startsWith("'")) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
}

/**
 * Extract wiki-style links from content
 * @param {string} content - File content
 * @returns {Array<string>} - List of linked files
 */
function extractWikiLinks(content) {
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  const links = new Set();
  let match;

  while ((match = wikiLinkRegex.exec(content)) !== null) {
    links.add(match[1]);
  }

  return Array.from(links);
}

/**
 * Extract standard markdown links from content
 * @param {string} content - File content
 * @returns {Array<string>} - List of linked files
 */
function extractMarkdownLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = new Set();
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    // Only include relative markdown links
    if (url.endsWith('.md') && !url.startsWith('http')) {
      links.add(url);
    }
  }

  return Array.from(links);
}

/**
 * Get heading structure from content
 * @param {string} content - File content
 * @returns {Array<Object>} - Array of headings with level and title
 */
function extractHeadings(content) {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      title: match[2].trim(),
    });
  }

  return headings;
}

/**
 * Recursively scan directory for markdown files
 * @param {string} dir - Directory to scan
 * @param {string} baseDir - Base directory for relative paths
 * @returns {Array<Object>} - Array of file metadata
 */
function scanDirectory(dir, baseDir = dir) {
  const files = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    // Skip excluded directories
    if (entry.isDirectory() && EXCLUDE_DIRS.some((excluded) => relativePath.includes(excluded))) {
      continue;
    }

    if (entry.isDirectory()) {
      // Recurse into subdirectories
      files.push(...scanDirectory(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Process markdown file
      const content = fs.readFileSync(fullPath, 'utf-8');
      const { frontmatter, content: body } = parseFrontmatter(content);

      const stats = fs.statSync(fullPath);
      const wikiLinks = extractWikiLinks(body);
      const markdownLinks = extractMarkdownLinks(body);
      const headings = extractHeadings(body);

      files.push({
        path: relativePath,
        title: frontmatter.title || extractTitleFromHeadings(headings) || entry.name,
        description: frontmatter.description || extractDescription(body),
        tags: frontmatter.tags || [],
        related: frontmatter.related || [],
        audience: frontmatter.audience || [],
        priority: frontmatter.priority || 'medium',
        category: frontmatter.category || extractCategoryFromPath(relativePath),
        last_updated: frontmatter.last_updated || stats.mtime.toISOString().split('T')[0],
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        size: stats.size,
        word_count: body.split(/\s+/).length,
        headings: headings,
        links_to: [...wikiLinks, ...markdownLinks],
      });
    }
  }

  return files;
}

/**
 * Extract title from frontmatter or first heading
 */
function extractTitleFromHeadings(headings) {
  if (headings.length > 0) {
    const firstHeading = headings.find((h) => h.level === 1);
    return firstHeading ? firstHeading.title : headings[0].title;
  }
  return null;
}

/**
 * Extract description from first paragraph
 */
function extractDescription(content) {
  const firstParagraph = content.split('\n\n')[0].replace(/^[#\s]+/, '').trim();
  return firstParagraph.length > 200 ? firstParagraph.slice(0, 197) + '...' : firstParagraph;
}

/**
 * Extract category from file path
 */
function extractCategoryFromPath(filePath) {
  const parts = filePath.split(path.sep);
  if (parts.length > 0 && parts[0].match(/^\d{2}/)) {
    return parts[0];
  }
  return 'uncategorized';
}

/**
 * Build link graph from files
 */
function buildLinkGraph(files) {
  const graph = {};
  const pathMap = {};

  // Build path lookup map
  for (const file of files) {
    const dir = path.dirname(file.path);
    pathMap[file.path] = file;

    // Initialize graph entry
    graph[file.path] = {
      title: file.title,
      links_to: [],
      linked_from: [],
      tags: file.tags,
      category: file.category,
    };
  }

  // Resolve links
  for (const file of files) {
    for (const link of file.links_to) {
      // Resolve relative path
      const basePath = path.dirname(file.path);
      let resolvedPath = path.join(basePath, link);

      // Normalize path separators and remove .md extension
      resolvedPath = resolvedPath.replace(/\.md$/, '').replace(/\\/g, '/');

      // Try to find matching file
      let matchedFile = null;
      if (pathMap[resolvedPath + '.md']) {
        matchedFile = pathMap[resolvedPath + '.md'];
      } else if (pathMap[resolvedPath + '/README.md']) {
        matchedFile = pathMap[resolvedPath + '/README.md'];
      } else {
        // Try fuzzy match
        const targetFile = files.find((f) => f.path.replace(/\.md$/, '').endsWith(resolvedPath));
        if (targetFile) {
          matchedFile = targetFile;
        }
      }

      if (matchedFile) {
        graph[file.path].links_to.push(matchedFile.path);
        graph[matchedFile.path].linked_from.push(file.path);
      }
    }
  }

  return graph;
}

/**
 * Generate tag index
 */
function buildTagIndex(files) {
  const index = {};

  for (const file of files) {
    for (const tag of file.tags) {
      if (!index[tag]) {
        index[tag] = [];
      }
      index[tag].push(file.path);
    }
  }

  return index;
}

/**
 * Generate category index
 */
function buildCategoryIndex(files) {
  const index = {};

  for (const file of files) {
    if (!index[file.category]) {
      index[file.category] = [];
    }
    index[file.category].push(file.path);
  }

  return index;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning documentation directory:', DOCS_DIR);

  // Scan all markdown files
  const files = scanDirectory(DOCS_DIR);
  console.log(`📄 Found ${files.length} markdown files`);

  // Build indices
  const graph = buildLinkGraph(files);
  const tagIndex = buildTagIndex(files);
  const categoryIndex = buildCategoryIndex(files);

  // Generate output
  const index = {
    metadata: {
      name: 'SISO Internal Documentation Index',
      version: '2.0.0',
      generated: new Date().toISOString(),
      total_files: files.length,
      generator: 'generate-docs-index.js',
    },
    stats: {
      total_files: files.length,
      total_tags: Object.keys(tagIndex).length,
      total_categories: Object.keys(categoryIndex).length,
      total_links: Object.values(graph).reduce((sum, node) => sum + node.links_to.length, 0),
    },
    files: files,
    graph: graph,
    tags: tagIndex,
    categories: categoryIndex,
    quick_start: {
      start_here: '01-overview/README.md',
      by_audience: {
        new_developers: ['01-overview/', '05-development/01-getting-started/'],
        developers: ['02-architecture/', '05-development/', '03-product/'],
        architects: ['02-architecture/'],
        product_managers: ['03-product/'],
        ai_engineers: ['04-integrations/01-ai-agents/', '04-integrations/02-mcp/'],
        qa_engineers: ['06-testing/'],
        devops: ['07-operations/'],
      },
      by_topic: {
        getting_started: '01-overview/',
        architecture: '02-architecture/',
        product: '03-product/',
        integrations: '04-integrations/',
        development: '05-development/',
        testing: '06-testing/',
        operations: '07-operations/',
        research: '08-knowledge/01-research/',
      },
    },
  };

  // Write output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log('✅ Generated index:', OUTPUT_FILE);
  console.log(`📊 Stats: ${index.stats.total_files} files, ${index.stats.total_tags} tags, ${index.stats.total_links} links`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { parseFrontmatter, scanDirectory, buildLinkGraph };
