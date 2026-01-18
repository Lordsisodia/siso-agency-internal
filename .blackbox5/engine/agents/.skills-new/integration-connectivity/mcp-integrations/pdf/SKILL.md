---
name: pdf
category: mcp
version: 1.0.0
description: Extract text, tables, metadata from PDFs with merge and annotation support
author: anthropics/skills
verified: true
tags: [pdf, documents, processing, extraction]
---

# PDF Processing

## Overview
Extract and manipulate PDF documents including text extraction, table parsing, metadata reading, merging, and annotation.

## When to Use This Skill
✅ Processing contracts and legal documents
✅ Extracting data from reports
✅ Combining multiple PDFs into one
✅ Adding annotations or watermarks
✅ Converting PDFs to other formats

## Text Extraction

### Basic Text Extraction
```python
import PyPDF2

def extract_text_from_pdf(pdf_path):
    """Extract all text from a PDF file."""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

# Usage
text = extract_text_from_pdf("document.pdf")
print(text)
```

### Extract Text from Specific Pages
```python
def extract_pages(pdf_path, page_numbers):
    """Extract text from specific pages (1-indexed)."""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page_num in page_numbers:
            if page_num <= len(reader.pages):
                page = reader.pages[page_num - 1]
                text += page.extract_text() + "\n"
    return text

# Usage: extract pages 1, 3, and 5
text = extract_pages("document.pdf", [1, 3, 5])
```

## Table Extraction

### Using pdfplumber
```python
import pdfplumbing

def extract_tables(pdf_path):
    """Extract all tables from a PDF."""
    tables = []
    with pdfplumbing.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_tables = page.extract_tables()
            tables.extend(page_tables)
    return tables

# Usage
tables = extract_tables("report.pdf")
for i, table in enumerate(tables):
    print(f"Table {i + 1}:")
    for row in table:
        print(row)
```

### Convert Tables to CSV
```python
import csv

def tables_to_csv(tables, output_path):
    """Save extracted tables to CSV file."""
    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        for table in tables:
            writer.writerows(table)
            writer.writerows([[]])  # Empty row between tables

# Usage
tables = extract_tables("report.pdf")
tables_to_csv(tables, "output.csv")
```

## Metadata Extraction

### Get PDF Metadata
```python
def get_pdf_metadata(pdf_path):
    """Extract metadata from PDF."""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        metadata = reader.metadata
    return {
        'title': metadata.get('/Title', ''),
        'author': metadata.get('/Author', ''),
        'subject': metadata.get('/Subject', ''),
        'creator': metadata.get('/Creator', ''),
        'producer': metadata.get('/Producer', ''),
        'creation_date': metadata.get('/CreationDate', ''),
        'pages': len(reader.pages)
    }

# Usage
metadata = get_pdf_metadata("document.pdf")
print(metadata)
```

## Merge PDFs

### Combine Multiple PDFs
```python
from PyPDF2 import PdfMerger

def merge_pdfs(pdf_paths, output_path):
    """Merge multiple PDFs into one."""
    merger = PdfMerger()
    for pdf_path in pdf_paths:
        merger.append(pdf_path)
    merger.write(output_path)
    merger.close()

# Usage
merge_pdfs(
    ["file1.pdf", "file2.pdf", "file3.pdf"],
    "merged.pdf"
)
```

### Merge Specific Pages
```python
def merge_selected_pages(source_paths, page_ranges, output_path):
    """Merge specific pages from multiple PDFs.
    page_ranges: list of (path, start_page, end_page) tuples
    """
    merger = PdfMerger()
    for path, start, end in page_ranges:
        merger.append(path, pages=(start, end))
    merger.write(output_path)
    merger.close()

# Usage: Merge pages 1-3 from file1 and pages 5-7 from file2
merge_selected_pages(
    [("file1.pdf", 0, 2), ("file2.pdf", 4, 6)],
    "selected-pages.pdf"
)
```

## Add Annotations

### Add Text Watermark
```python
from reportlab.pdfgen import canvas
from PyPDF2 import PdfReader, PdfWriter

def add_watermark(input_pdf, output_pdf, watermark_text):
    """Add text watermark to all pages."""
    # Create watermark
    watermark = canvas.Canvas("watermark.pdf")
    watermark.drawString(100, 100, watermark_text)
    watermark.save()

    # Add to all pages
    watermark_page = PdfReader("watermark.pdf").pages[0]
    reader = PdfReader(input_pdf)
    writer = PdfWriter()

    for page in reader.pages:
        page.merge_page(watermark_page)
        writer.add_page(page)

    with open(output_pdf, 'wb') as f:
        writer.write(f)

# Usage
add_watermark("input.pdf", "watermarked.pdf", "CONFIDENTIAL")
```

## OCR for Scanned PDFs

### Extract Text from Scanned PDFs
```python
import pytesseract
from PIL import Image
import fitz  # PyMuPDF

def ocr_pdf(pdf_path):
    """Extract text from scanned PDF using OCR."""
    doc = fitz.open(pdf_path)
    text = ""

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap()
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        text += pytesseract.image_to_string(img) + "\n"

    return text

# Usage (requires Tesseract installed)
text = ocr_pdf("scanned.pdf")
print(text)
```

## Common Operations

### Split PDF into Pages
```python
def split_pdf(pdf_path, output_dir):
    """Split PDF into individual pages."""
    reader = PyPDF2.PdfReader(pdf_path)
    for i, page in enumerate(reader.pages):
        writer = PyPDF2.PdfWriter()
        writer.add_page(page)
        with open(f"{output_dir}/page_{i+1}.pdf", 'wb') as f:
            writer.write(f)

# Usage
split_pdf("document.pdf", "output_pages")
```

### Rotate Pages
```python
def rotate_pages(input_pdf, output_pdf, rotation):
    """Rotate all pages by specified degrees (90, 180, 270)."""
    reader = PyPDF2.PdfReader(input_pdf)
    writer = PyPDF2.PdfWriter()

    for page in reader.pages:
        page.rotate(rotation)
        writer.add_page(page)

    with open(output_pdf, 'wb') as f:
        writer.write(f)

# Usage: rotate all pages 90 degrees clockwise
rotate_pages("input.pdf", "rotated.pdf", 90)
```

## Error Handling

### Robust PDF Processing
```python
def safe_pdf_operation(pdf_path, operation):
    """Safely perform PDF operation with error handling."""
    try:
        # Check if file exists
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        # Check if it's a valid PDF
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            if len(reader.pages) == 0:
                raise ValueError("PDF has no pages")

        # Perform operation
        result = operation(pdf_path)
        return result

    except PyPDF2.PdfReadError as e:
        print(f"Invalid PDF file: {e}")
    except Exception as e:
        print(f"Error processing PDF: {e}")
    return None

# Usage
result = safe_pdf_operation("document.pdf", extract_text_from_pdf)
```

## Integration with Claude
When working with PDFs, say:
- "Extract text from this PDF file"
- "Pull all tables from the report PDF"
- "Merge these PDFs into one document"
- "Add a watermark to each page"
- "What metadata does this PDF contain?"

Claude will:
- Choose the right extraction method
- Handle complex PDF structures
- Extract tables and data accurately
- Process multiple files efficiently
- Handle errors gracefully
