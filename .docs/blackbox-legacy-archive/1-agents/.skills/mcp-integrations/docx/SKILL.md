---
name: docx
category: mcp
version: 1.0.0
description: Create, edit, and analyze Word documents with tracked changes and comments support
author: anthropics/skills
verified: true
tags: [docx, word, documents, office]
---

# DOCX Processing

## Overview
Create, edit, and analyze Microsoft Word documents (.docx) with support for tracked changes, comments, formatting, and content extraction.

## When to Use This Skill
✅ Automating document generation
✅ Processing feedback and comments
✅ Extracting structured data from docs
✅ Creating reports programmatically
✅ Managing document templates

## Create Documents

### Basic Document Creation
```python
from docx import Document

def create_simple_document():
    """Create a simple Word document."""
    doc = Document()

    # Add heading
    doc.add_heading('Document Title', level=1)

    # Add paragraph
    doc.add_paragraph('This is a paragraph of text.')

    # Add another paragraph with formatting
    para = doc.add_paragraph()
    run = para.add_run('Bold and italic text')
    run.bold = True
    run.italic = True

    # Save document
    doc.save('output.docx')

# Usage
create_simple_document()
```

### Document with Structure
```python
def create_structured_document():
    """Create a document with hierarchical structure."""
    doc = Document()

    # Title
    doc.add_heading('Project Report', level=0)

    # Sections
    doc.add_heading('Executive Summary', level=1)
    doc.add_paragraph('Brief summary of the project.')

    doc.add_heading('Introduction', level=1)
    doc.add_heading('Background', level=2)
    doc.add_paragraph('Context and background information.')

    doc.add_heading('Methodology', level=2)
    doc.add_paragraph('Approach and methods used.')

    # Lists
    doc.add_heading('Key Findings', level=1)
    doc.add_paragraph('Main findings:', style='List Bullet')
    doc.add_paragraph('Finding 1', style='List Bullet')
    doc.add_paragraph('Finding 2', style='List Bullet')

    doc.save('structured_document.docx')
```

## Extract Content

### Extract All Text
```python
def extract_text_from_docx(docx_path):
    """Extract all text from a Word document."""
    doc = Document(docx_path)
    text = []

    for paragraph in doc.paragraphs:
        text.append(paragraph.text)

    return '\n'.join(text)

# Usage
text = extract_text_from_docx("document.docx")
print(text)
```

### Extract by Structure
```python
def extract_document_structure(docx_path):
    """Extract document with hierarchical structure."""
    doc = Document(docx_path)
    structure = {
        'title': '',
        'headings': [],
        'paragraphs': [],
        'tables': []
    }

    for element in doc.element.body:
        # Process paragraphs
        for para in doc.paragraphs:
            if para.style.name.startswith('Heading'):
                level = int(para.style.name[-1])
                structure['headings'].append({
                    'level': level,
                    'text': para.text
                })
            else:
                structure['paragraphs'].append(para.text)

        # Process tables
        for table in doc.tables:
            table_data = []
            for row in table.rows:
                row_data = [cell.text for cell in row.cells]
                table_data.append(row_data)
            structure['tables'].append(table_data)

    return structure
```

### Extract Tables
```python
def extract_tables(docx_path):
    """Extract all tables from document."""
    doc = Document(docx_path)
    tables = []

    for table in doc.tables:
        table_data = []
        for row in table.rows:
            row_data = [cell.text.strip() for cell in row.cells]
            table_data.append(row_data)
        tables.append(table_data)

    return tables

# Usage
tables = extract_tables("report.docx")
for i, table in enumerate(tables):
    print(f"Table {i + 1}:")
    for row in table:
        print(row)
```

## Working with Templates

### Use Document Template
```python
def fill_template(template_path, output_path, data):
    """Fill a Word template with data."""
    doc = Document(template_path)

    # Replace placeholders
    for paragraph in doc.paragraphs:
        for key, value in data.items():
            if key in paragraph.text:
                paragraph.text = paragraph.text.replace(key, str(value))

    # Replace in tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for key, value in data.items():
                    if key in cell.text:
                        cell.text = cell.text.replace(key, str(value))

    doc.save(output_path)

# Usage
data = {
    '{{NAME}}': 'John Doe',
    '{{DATE}}': '2024-01-15',
    '{{AMOUNT}}': '$1,000'
}
fill_template('template.docx', 'output.docx', data)
```

## Track Changes

### Enable Tracked Changes
```python
from docx.oxml.ns import qn

def track_changes(doc):
    """Enable track changes in document."""
    settings = doc.settings
    settings.trackRevisions = True

    # This requires Word to be opened with track changes enabled
    # Programmatic track changes is limited in python-docx
    doc.save('document_with_track_changes.docx')
```

### Review Comments
```python
def extract_comments(docx_path):
    """Extract all comments from document."""
    doc = Document(docx_path)
    comments = []

    # Comments are stored in XML
    # This is simplified - actual implementation requires XML parsing
    for element in doc.element.body:
        if element.tag.endswith('comment'):
            comments.append({
                'author': element.get('author'),
                'date': element.get('date'),
                'text': element.text
            })

    return comments
```

## Formatting

### Apply Styles
```python
def apply_formatting(doc):
    """Apply various formatting to document."""
    # Bold text
    para = doc.add_paragraph()
    run = para.add_run('Bold text')
    run.bold = True

    # Italic text
    run = para.add_run(' italic text')
    run.italic = True

    # Underlined text
    run = para.add_run(' underlined text')
    run.underline = True

    # Colored text
    run = para.add_run(' red text')
    run.font.color.rgb = RGBColor(255, 0, 0)

    # Font size
    run = para.add_run(' large text')
    run.font.size = Pt(18)

    # Font family
    run = para.add_run(' Arial text')
    run.font.name = 'Arial'

    return doc
```

### Add Tables
```python
def create_table(doc, data, headers=None):
    """Create formatted table in document."""
    table = doc.add_table(rows=len(data) + (1 if headers else 0),
                         cols=len(data[0]))
    table.style = 'Light Grid Accent 1'

    if headers:
        header_cells = table.rows[0].cells
        for i, header in enumerate(headers):
            header_cells[i].text = header
            # Bold headers
            for paragraph in header_cells[i].paragraphs:
                for run in paragraph.runs:
                    run.bold = True

    # Add data
    start_row = 1 if headers else 0
    for i, row_data in enumerate(data):
        row = table.rows[i + start_row]
        for j, cell_data in enumerate(row_data):
            row.cells[j].text = str(cell_data)

    return doc

# Usage
doc = Document()
data = [
    ['Alice', 25, 'Engineer'],
    ['Bob', 30, 'Designer'],
    ['Charlie', 35, 'Manager']
]
create_table(doc, data, headers=['Name', 'Age', 'Role'])
doc.save('table_document.docx')
```

## Advanced Operations

### Find and Replace
```python
def find_replace(doc, find_text, replace_text):
    """Find and replace text in document."""
    for paragraph in doc.paragraphs:
        if find_text in paragraph.text:
            paragraph.text = paragraph.text.replace(find_text, replace_text)

    # Check tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if find_text in cell.text:
                    cell.text = cell.text.replace(find_text, replace_text)

    return doc
```

### Merge Documents
```python
def merge_documents(doc_paths, output_path):
    """Merge multiple Word documents."""
    merged_doc = Document()

    for doc_path in doc_paths:
        doc = Document(doc_path)

        # Copy all elements
        for element in doc.element.body:
            merged_doc.element.body.append(element)

    merged_doc.save(output_path)

# Usage
merge_documents(
    ['section1.docx', 'section2.docx', 'section3.docx'],
    'merged.docx'
)
```

### Add Page Numbers
```python
def add_page_numbers(doc):
    """Add page numbers to document (simplified)."""
    # Page numbers require more complex XML manipulation
    # This is a simplified version
    section = doc.sections[0]
    footer = section.footer
    paragraph = footer.paragraphs[0]
    paragraph.text = "Page "
    run = paragraph.add_run()
    # Add field code for page number
    # Implementation requires more complex XML handling
    return doc
```

## Integration with Claude
When working with DOCX files, say:
- "Create a Word document with [structure]"
- "Extract all text from this document"
- "Fill in this template with [data]"
- "Pull all tables from the report"
- "Merge these documents into one"

Claude will:
- Structure documents correctly
- Apply proper formatting
- Extract content accurately
- Handle templates reliably
- Manage complex layouts
