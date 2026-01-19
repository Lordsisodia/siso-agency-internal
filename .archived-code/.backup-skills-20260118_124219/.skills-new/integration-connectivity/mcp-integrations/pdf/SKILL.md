---
name: pdf
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Extract text, tables, metadata from PDFs with merge and annotation support
author: blackbox5/mcp
verified: true
tags: [mcp, pdf, documents, processing, extraction]
---

# PDF Processing

<context>
Extract and manipulate PDF documents including text extraction, table parsing, metadata reading, merging, and annotation.

**When to Use:**
- Processing contracts and legal documents
- Extracting data from reports
- Combining multiple PDFs into one
- Adding annotations or watermarks
- Converting PDFs to other formats
</context>

<instructions>
When working with PDFs, use PyPDF2 for basic operations and pdfplumber for advanced table extraction. For scanned PDFs, use OCR with Tesseract.

Always handle errors gracefully and validate PDF structure before processing.
</instructions>

<workflow>
  <phase name="Text Extraction">
    <goal>Extract text content from PDF</goal>
    <steps>
      <step>Open PDF with PdfReader</step>
      <step>Iterate through pages</step>
      <step>Extract text from each page</step>
      <step>Combine and format output</step>
    </steps>
  </phase>

  <phase name="Table Extraction">
    <goal>Extract tabular data from PDF</goal>
    <steps>
      <step>Open PDF with pdfplumber</step>
      <step>Identify pages with tables</step>
      <step>Extract table data</step>
      <step>Convert to structured format (CSV, JSON)</step>
    </steps>
  </phase>

  <phase name="Document Manipulation">
    <goal>Modify and combine PDFs</goal>
    <steps>
      <step>Load source PDFs</step>
      <step>Merge pages as needed</step>
      <step>Add annotations or watermarks</step>
      <step>Save output PDF</step>
    </steps>
  </phase>

  <phase name="OCR Processing">
    <goal>Extract text from scanned PDFs</goal>
    <steps>
      <step>Convert PDF pages to images</step>
      <step>Apply OCR with Tesseract</step>
      <step>Post-process extracted text</step>
      <step>Handle OCR errors</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Text Extraction">
    <skill name="extract_text">
      <purpose>Extract all text from PDF</purpose>
      <usage>Extract text from document.pdf</usage>
    </skill>
    <skill name="extract_pages">
      <purpose>Extract text from specific pages</purpose>
      <usage>Get text from pages 1, 3, and 5</usage>
      <parameters>
        <param name="page_numbers">List of page numbers to extract (1-indexed)</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Table Extraction">
    <skill name="extract_tables">
      <purpose>Extract all tables from PDF</purpose>
      <usage>Pull all tables from report.pdf</usage>
    </skill>
    <skill name="tables_to_csv">
      <purpose>Save extracted tables to CSV</purpose>
      <usage>Convert tables to output.csv</usage>
    </skill>
  </skill_group>

  <skill_group name="Metadata Operations">
    <skill name="get_metadata">
      <purpose>Extract PDF metadata</purpose>
      <usage>Get title, author, creation date</usage>
      <returns>Title, author, subject, creator, producer, creation date, page count</returns>
    </skill>
  </skill_group>

  <skill_group name="PDF Manipulation">
    <skill name="merge_pdfs">
      <purpose>Combine multiple PDFs into one</purpose>
      <usage>Merge file1.pdf, file2.pdf, file3.pdf into merged.pdf</usage>
    </skill>
    <skill name="split_pdf">
      <purpose>Split PDF into individual pages</purpose>
      <usage>Split document.pdf into separate page files</usage>
    </skill>
    <skill name="rotate_pages">
      <purpose>Rotate pages by specified degrees</purpose>
      <usage>Rotate all pages 90 degrees clockwise</usage>
    </skill>
    <skill name="merge_selected_pages">
      <purpose>Merge specific pages from multiple PDFs</purpose>
      <usage>Merge pages 1-3 from file1 and pages 5-7 from file2</usage>
    </skill>
  </skill_group>

  <skill_group name="Annotation">
    <skill name="add_watermark">
      <purpose>Add text watermark to all pages</purpose>
      <usage>Add 'CONFIDENTIAL' watermark to each page</usage>
    </skill>
  </skill_group>

  <skill_group name="OCR">
    <skill name="ocr_pdf">
      <purpose>Extract text from scanned PDF using OCR</purpose>
      <usage>Extract text from scanned.pdf with OCR</usage>
      <note>Requires Tesseract to be installed</note>
    </skill>
  </skill_group>
</available_skills>

<best_practices>
  <do>
    <item>Validate PDF before processing</item>
    <item>Handle encoding issues properly</item>
    <item>Use error handling for file operations</item>
    <item>Test on small samples first</item>
    <item>Process pages in chunks for large PDFs</item>
    <item>Backup original PDFs before modification</item>
  </do>
  <dont>
    <item>Assume all PDFs are text-based</item>
    <item>Process entire large PDF at once</item>
    <item>Ignore page ranges for extraction</item>
    <item>Forget to close file handles</item>
    <item>Hardcode file paths</item>
  </dont>
</best_practices>

<rules>
  <rule priority="high">Always validate PDF structure before processing</rule>
  <rule priority="high">Use proper error handling for file operations</rule>
  <rule priority="medium">Process large PDFs in chunks</rule>
  <rule priority="medium">Handle scanned PDFs with OCR</rule>
  <rule priority="low">Clean up temporary files after processing</rule>
</rules>

<error_handling>
  <error>
    <condition>Invalid PDF format</condition>
    <solution>
      <step>Verify file is valid PDF</step>
      <step>Check file extension is .pdf</step>
      <step>Try opening in PDF viewer</step>
    </solution>
  </error>
  <error>
    <condition>Encrypted PDF</condition>
    <solution>
      <step>Check if PDF is password protected</step>
      <step>Provide password if available</step>
      <step>Use appropriate decryption tool</step>
    </solution>
  </error>
  <error>
    <condition>No text found</condition>
    <solution>
      <step>PDF might be scanned/image-based</step>
      <step>Use OCR for extraction</step>
      <step>Check for embedded fonts</step>
    </solution>
  </error>
  <error>
    <condition>Table extraction fails</condition>
    <solution>
      <step>Try different extraction method</step>
      <step>Check table structure complexity</step>
      <step>Manually verify table boundaries</step>
    </solution>
  </error>
  <error>
    <condition>OCR not working</condition>
    <solution>
      <step>Verify Tesseract is installed</step>
      <step>Check image quality of pages</step>
      <step>Try preprocessing images</step>
    </solution>
  </error>
</error_handling>

<integration_notes>
  <libraries>
    <library name="PyPDF2">
      <use>Basic text extraction, merging, splitting</use>
    </library>
    <library name="pdfplumber">
      <use>Advanced table extraction</use>
    </library>
    <library name="Tesseract">
      <use>OCR for scanned PDFs</use>
    </library>
    <library name="reportlab">
      <use>Adding watermarks and annotations</use>
    </library>
  </libraries>
</integration_notes>

<examples>
  <example>
    <scenario>Extract Report Data</scenario>
    <description>Extract data from financial report PDF</description>
    <operations>
      <op>Extract all text from report</op>
      <op>Parse tables with financial data</op>
      <op>Convert tables to CSV format</op>
      <op>Save extracted data</op>
    </operations>
  </example>
  <example>
    <scenario>Combine Documents</scenario>
    <description>Merge multiple sections into one PDF</description>
    <operations>
      <op>Load section PDFs</op>
      <op>Merge in correct order</op>
      <op>Add watermark to final PDF</op>
      <op>Save as complete document</op>
    </operations>
  </example>
  <example>
    <scenario>Process Scanned Document</scenario>
    <description>Extract text from scanned contract</description>
    <operations>
      <op>Convert pages to images</op>
      <op>Apply OCR to each page</op>
      <op>Post-process extracted text</op>
      <p>Clean up OCR errors</op>
    </operations>
  </example>
</examples>

<advanced_operations>
  <operation>Batch Processing</operation>
  <description>Process multiple PDFs in parallel</description>
  <operation>Form Data Extraction</operation>
  <description>Extract data from PDF forms</description>
  <operation>Image Extraction</operation>
  <description>Extract embedded images from PDF</description>
  <operation>Compression</operation>
  <description>Reduce PDF file size</description>
</advanced_operations>
