import React from 'react';

/**
 * AirtableStyles Component
 * 
 * Injects comprehensive CSS styles for the Airtable-like interface.
 * Includes dark theme, scrollbar styling, animations, and responsive design.
 * 
 * Extracted from AirtablePartnersTable.tsx (1,196 lines → focused component)
 */

export const AirtableStyles: React.FC = () => {
  return (
    <style>{`
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .airtable-container {
        background: #111111;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        overflow: hidden;
        border: 1px solid #222;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 13px;
      }

      .toolbar {
        background: #1a1a1a;
        border-bottom: 1px solid #333;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .toolbar button {
        background: #ff6b35;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        transition: all 0.2s;
      }

      .toolbar button:hover {
        background: #ff5722;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
      }

      .toolbar button:active {
        transform: translateY(0);
      }

      .table-wrapper {
        overflow: auto;
        max-height: 70vh;
        position: relative;
        background: #0a0a0a;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
      }

      /* Custom scrollbar styling */
      .table-wrapper::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }

      .table-wrapper::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 6px;
      }

      .table-wrapper::-webkit-scrollbar-thumb {
        background: #ff6b35;
        border-radius: 6px;
        border: 2px solid #1a1a1a;
      }

      .table-wrapper::-webkit-scrollbar-thumb:hover {
        background: #ff5722;
      }

      .table-wrapper::-webkit-scrollbar-corner {
        background: #1a1a1a;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        position: relative;
        min-width: 2000px;
      }

      th {
        background: #1a1a1a;
        border: 1px solid #333;
        padding: 10px 12px;
        text-align: left;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 10;
        user-select: none;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #fff;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      th:hover {
        background: #222;
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .column-icon {
        margin-right: 6px;
        opacity: 0.8;
        color: #ff6b35;
      }

      .dropdown-arrow {
        opacity: 0;
        transition: opacity 0.2s;
        color: #ff6b35;
      }

      th:hover .dropdown-arrow {
        opacity: 0.8;
      }

      .row-number {
        background: #1a1a1a;
        border: 1px solid #333;
        text-align: center;
        color: #666;
        font-size: 11px;
        width: 40px;
        position: sticky;
        left: 0;
        z-index: 5;
      }

      td.row-number {
        background: #1a1a1a;
        border-right: 2px solid #333;
      }

      td {
        border: 1px solid #222;
        padding: 10px 12px;
        position: relative;
        background: #111;
        cursor: text;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #e0e0e0;
        transition: all 0.2s;
      }

      td:hover {
        box-shadow: inset 0 0 0 2px #ff6b35;
        z-index: 1;
        background: #1a1a1a;
      }

      .cell-tag {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 16px;
        font-size: 11px;
        font-weight: 600;
        margin-right: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .tag-blue { background: #1a3a52; color: #4a9eff; border: 1px solid #2a4a62; }
      .tag-green { background: #1a4a2a; color: #4aff6a; border: 1px solid #2a5a3a; }
      .tag-yellow { background: #4a3a1a; color: #ffda4a; border: 1px solid #5a4a2a; }
      .tag-red { background: #4a1a1a; color: #ff4a4a; border: 1px solid #5a2a2a; }
      .tag-purple { background: #3a1a4a; color: #da4aff; border: 1px solid #4a2a5a; }
      .tag-orange { background: #4a2a1a; color: #ff6b35; border: 1px solid #5a3a2a; }

      .status-tag {
        display: inline-flex;
        align-items: center;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }

      .status-qualified { background: #1a4a2a; color: #4aff6a; border: 1px solid #2a5a3a; }
      .status-converted { background: #1a3a52; color: #4a9eff; border: 1px solid #2a4a62; }
      .status-waiting { background: rgba(255, 107, 53, 0.2); color: #ff6b35; border: 1px solid #ff6b35; }
      .status-declined { background: #4a1a1a; color: #ff4a4a; border: 1px solid #5a2a2a; }

      tr:hover td {
        background: #1a1a1a;
      }

      tr.selected td {
        background: rgba(255, 107, 53, 0.1);
        border-color: #333;
      }

      .add-row {
        border: 2px dashed #333;
        background: #0a0a0a;
        padding: 12px 16px;
        text-align: left;
        cursor: pointer;
        color: #666;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
        font-weight: 500;
      }

      .add-row:hover {
        background: #1a1a1a;
        color: #ff6b35;
        border-color: #ff6b35;
      }

      .context-menu {
        position: absolute;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        padding: 4px 0;
        z-index: 1000;
        display: none;
      }

      .context-menu.visible {
        display: block;
      }

      .context-menu-item {
        padding: 10px 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #e0e0e0;
        transition: all 0.2s;
      }

      .context-menu-item:hover {
        background: #ff6b35;
        color: #fff;
      }

      .cell-editor {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid #ff6b35;
        background: #1a1a1a;
        padding: 8px 10px;
        font-family: inherit;
        font-size: inherit;
        z-index: 100;
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        color: #fff;
        outline: none;
      }

      .url-cell {
        color: #ff6b35;
        text-decoration: none;
      }

      .url-cell:hover {
        text-decoration: underline;
      }

      @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }

      .loading {
        animation: pulse 1.5s ease-in-out infinite;
      }
    `}</style>
  );
};

export default AirtableStyles;