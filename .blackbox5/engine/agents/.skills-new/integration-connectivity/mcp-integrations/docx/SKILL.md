---
name: docx
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Create, edit, and analyze Word documents with tracked changes and comments support
author: blackbox5/mcp
verified: true
tags: [mcp, docx, word, documents, office]
---

# DOCX Processing

<context>
Create, edit, and analyze Microsoft Word documents (.docx) with support for tracked changes, comments, formatting, and content extraction.

**When to Use:**
- Automating document generation
- Processing feedback and comments
- Extracting structured data from docs
- Creating reports programmatically
- Managing document templates
</context>

<instructions>
When working with DOCX files, use the python-docx library for document manipulation. For advanced features like track changes, additional XML parsing may be required.

Always backup original documents before making changes.
</instructions>

<workflow>
  <phase name="Document Creation">
    <goal>Create new Word documents programmatically</goal>
    <steps>
      <step>Initialize Document object</step>
      <step>Add headings and paragraphs</step>
      <step>Apply formatting (bold, italic, colors)</step>
      <step>Save document to file</step>
    </steps>
  </phase>

  <phase name="Content Extraction">
    <goal>Extract text and data from existing documents</goal>
    <steps>
      <step>Load document with Document()</step>
      <step>Iterate through paragraphs</step>
      <step>Extract text with structure</step>
      <step>Parse tables if present</step>
    </steps>
  </phase>

  <phase name="Template Processing">
    <goal>Fill templates with dynamic data</goal>
    <steps>
      <step>Load template document</step>
      <step>Identify placeholder markers</step>
      <step>Replace with actual data</step>
      <step>Save as new document</step>
    </steps>
  </phase>

  <phase name="Document Modification">
    <goal>Edit existing documents</goal>
    <steps>
      <step>Load target document</step>
      <step>Find content to modify</step>
      <step>Apply changes</step>
      <step>Preserve formatting where possible</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Document Creation">
    <skill name="create_simple_document">
      <purpose>Create a basic Word document</purpose>
      <usage>Create a document with title and paragraphs</usage>
    </skill>
    <skill name="create_structured_document">
      <purpose>Create document with hierarchical structure</purpose>
      <usage>Create a report with headings and sections</usage>
    </skill>
    <skill name="add_formatting">
      <purpose>Apply text formatting (bold, italic, colors, fonts)</purpose>
      <usage>Make the heading bold and blue</usage>
    </skill>
  </skill_group>

  <skill_group name="Content Extraction">
    <skill name="extract_text">
      <purpose>Extract all text from document</purpose>
      <usage>Get all text content from report.docx</usage>
    </skill>
    <skill name="extract_structure">
      <purpose>Extract document with headings hierarchy</purpose>
      <usage>Get document structure with heading levels</usage>
    </skill>
    <skill name="extract_tables">
      <purpose>Extract all tables from document</purpose>
      <usage>Pull all tables from the report</usage>
    </skill>
  </skill_group>

  <skill_group name="Template Operations">
    <skill name="fill_template">
      <purpose>Replace placeholders in template</purpose>
      <usage>Fill template with data dictionary</usage>
    </skill>
    <skill name="find_replace">
      <purpose>Find and replace text throughout document</purpose>
      <usage>Replace all instances of 'old' with 'new'</usage>
    </skill>
  </skill_group>

  <skill_group name="Table Operations">
    <skill name="create_table">
      <purpose>Add formatted table to document</purpose>
      <usage>Create table with headers and data</usage>
    </skill>
    <skill name="add_table_data">
      <purpose>Populate table with data</purpose>
      <usage>Fill table with CSV data</usage>
    </skill>
  </skill_group>

  <skill_group name="Advanced Operations">
    <skill name="merge_documents">
      <purpose>Combine multiple documents</purpose>
      <usage>Merge section1.docx, section2.docx, section3.docx</usage>
    </skill>
    <skill name="add_page_numbers">
      <purpose>Add page numbers to document</purpose>
      <usage>Add page numbers to footer</usage>
    </skill>
    <skill name="extract_comments">
      <purpose>Extract review comments from document</purpose>
      <usage>Get all comments and their authors</usage>
    </skill>
  </skill_group>
</available_skills>

<best_practices>
  <do>
    <item>Backup documents before modification</item>
    <item>Use with statements for file operations</item>
    <item>Validate extracted data structure</item>
    <item>Handle encoding issues properly</item>
    <item>Test template replacements</item>
    <item>Preserve original formatting when editing</item>
  </do>
  <dont>
    <item>Modify documents without backup</item>
    <item>Assume consistent formatting</item>
    <item>Ignore encoding errors</item>
    <item>Hardcode document paths</item>
    <item>Forget to save changes</item>
  </dont>
</best_practices>

<rules>
  <rule priority="high">Always backup before modifying documents</rule>
  <rule priority="high">Use proper error handling for file operations</rule>
  <rule priority="medium">Validate document structure before processing</rule>
  <rule priority="medium">Handle encoding issues for international text</rule>
  <rule priority="low">Clean up temporary files after processing</rule>
</rules>

<error_handling>
  <error>
    <condition>Document not found</condition>
    <solution>
      <step>Verify file path is correct</step>
      <step>Check file extension is .docx</step>
      <step>Ensure file exists and is accessible</step>
    </solution>
  </error>
  <error>
    <condition>Corrupted document</condition>
    <solution>
      <step>Try opening in Word to verify</step>
      <step>Check if file is valid .docx format</step>
      <step>Use backup if available</step>
    </solution>
  </error>
  <error>
    <condition>Placeholder not found</condition>
    <solution>
      <step>Verify placeholder spelling</step>
      <step>Check document content manually</step>
      <step>Use case-insensitive search</step>
    </solution>
  </error>
  <error>
    <condition>Encoding issues</condition>
    <solution>
      <step>Specify encoding explicitly</step>
      <step>Use utf-8 for international text</step>
      <step>Handle special characters properly</step>
    </solution>
  </error>
</error_handling>

<integration_notes>
  <feature>Tracked Changes</feature>
  <note>Programmatic track changes requires XML manipulation</note>
  <feature>Comments</feature>
  <note>Extract comments via XML parsing</note>
  <feature>Templates</feature>
  <note>Use {{PLACEHOLDER}} format for template variables</note>
</integration_notes>

<examples>
  <example>
    <scenario>Create Document</scenario>
    <description>Create a new document with structure</description>
    <operations>
      <op>Add title heading</op>
      <op>Add executive summary section</op>
      <op>Create bulleted list of findings</op>
      <op>Save as report.docx</op>
    </operations>
  </example>
  <example>
    <scenario>Extract Data</scenario>
    <description>Pull data from existing document</description>
    <operations>
      <op>Extract all text content</op>
      <op>Parse document structure</op>
      <p>Extract all tables to CSV</op>
    </operations>
  </example>
  <example>
    <scenario>Fill Template</scenario>
    <description>Replace placeholders with data</description>
    <operations>
      <op>Load template.docx</op>
      <op>Replace {{NAME}} with 'John Doe'</op>
      <op>Replace {{DATE}} with current date</op>
      <op>Save as output.docx</op>
    </operations>
  </example>
</examples>
