import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CopyIcon, DownloadIcon, CheckIcon } from './icons';

// Declare Quill and other libraries from window object for TypeScript
declare const Quill: any;
declare const jsPDF: any;
declare const docx: any;

interface NotesProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const QuillToolbar = () => (
  <div id="quill-toolbar">
    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="">Normal</option>
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-underline" />
      <button className="ql-strike" />
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered" />
      <button className="ql-list" value="bullet" />
    </span>
    <span className="ql-formats">
      <button className="ql-blockquote" />
      <button className="ql-link" />
    </span>
    <span className="ql-formats">
      <button className="ql-clean" />
    </span>
  </div>
);


const Notes: React.FC<NotesProps> = ({ value, onChange, onFocus, onBlur }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillInstance = useRef<any>(null);

  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown if clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: '#quill-toolbar'
        },
        placeholder: 'Type your notes here...',
      });

      // Set initial content if available
      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }
      
      quill.on('text-change', (_delta, _oldDelta, source) => {
        if (source === 'user') {
          onChange(quill.root.innerHTML);
        }
      });
      
      // Add focus/blur handlers for calculator interaction
      if (onFocus) {
        quill.on('selection-change', (range) => {
          if (range) {
            onFocus();
          } else if (onBlur) {
            onBlur();
          }
        });
      }
      
      quillInstance.current = quill;
    }
  }, [value, onChange, onFocus, onBlur]);

  const handleCopy = useCallback(() => {
    if (quillInstance.current) {
      const textToCopy = quillInstance.current.getText();
      navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, []);

  const downloadFile = (filename: string, content: BlobPart, mime: string) => {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };
  
  const handleDownloadTxt = useCallback(() => {
    if (quillInstance.current && !isDownloading) {
      setIsDownloading(true);
      try {
        const text = quillInstance.current.getText();
        downloadFile('notes.txt', text, 'text/plain;charset=utf-8');
      } finally {
        setTimeout(() => setIsDownloading(false), 1000);
      }
    }
  }, [isDownloading]);

  const handleDownloadDoc = useCallback(async () => {
    if (quillInstance.current && !isDownloading) {
      setIsDownloading(true);
      try {
        // Debug: log what's available
        console.log('docx available:', typeof docx !== 'undefined');
        console.log('window.docx available:', typeof window !== 'undefined' && !!(window as any).docx);
        
        // Try to access the docx library
        let docxLib;
        if (typeof docx !== 'undefined') {
          docxLib = docx;
          console.log('Using global docx');
        } else if (typeof window !== 'undefined' && (window as any).docx) {
          docxLib = (window as any).docx;
          console.log('Using window.docx');
        } else {
          console.error('docx library not found, falling back to RTF');
          
          // Create RTF format as fallback
          const text = quillInstance.current.getText();
          const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${text.replace(/\n/g, '\\par ')}}`;
          downloadFile('notes.rtf', rtfContent, 'application/rtf');
          alert('DOCX export not available. Downloaded as RTF instead. You can open this in Word to convert to DOCX.');
          return;
        }
        
        // Get the text content from Quill
        const text = quillInstance.current.getText();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // Create a new document using the docx library
        const { Document, Packer, Paragraph, TextRun } = docxLib;
        
        const doc = new Document({
          sections: [{
            properties: {},
            children: lines.map(line => 
              new Paragraph({
                children: [new TextRun(line)]
              })
            )
          }]
        });
        
        // Generate and download the document
        const blob = await Packer.toBlob(doc);
        downloadFile('notes.docx', blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        
      } catch (error) {
        console.error('Error creating document:', error);
        // Fallback to HTML download
        console.log('Falling back to HTML download');
        const htmlContent = quillInstance.current.root.innerHTML;
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Notes</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                p { margin: 0 0 1em 0; }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `;
        downloadFile('notes.html', fullHtml, 'text/html');
        alert('DOCX export failed. Downloaded as HTML instead. You can open this in Word to convert to DOCX.');
      } finally {
        setTimeout(() => setIsDownloading(false), 1000);
      }
    }
  }, [isDownloading]);

  const handleDownloadPdf = useCallback(() => {
    if (quillInstance.current && !isDownloading) {
      setIsDownloading(true);
      try {
        // Debug: log what's available
        console.log('jsPDF available:', typeof jsPDF !== 'undefined');
        console.log('window.jspdf available:', typeof window !== 'undefined' && !!(window as any).jspdf);
        console.log('window.jsPDF available:', typeof window !== 'undefined' && !!(window as any).jsPDF);
        
        // Try different ways to access jsPDF
        let jsPDFConstructor;
        if (typeof jsPDF !== 'undefined') {
          jsPDFConstructor = jsPDF;
          console.log('Using global jsPDF');
        } else if (typeof window !== 'undefined' && (window as any).jspdf) {
          jsPDFConstructor = (window as any).jspdf.jsPDF;
          console.log('Using window.jspdf.jsPDF');
        } else if (typeof window !== 'undefined' && (window as any).jsPDF) {
          jsPDFConstructor = (window as any).jsPDF;
          console.log('Using window.jsPDF');
        } else {
          console.error('jsPDF not found in any expected location');
          alert('PDF export library not loaded. Please refresh the page and try again.');
          return;
        }
        
        const doc = new jsPDFConstructor();
        const text = quillInstance.current.getText();
        
        // Better text handling for PDF
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxLineWidth = pageWidth - (margin * 2);
        
        const lines = doc.splitTextToSize(text, maxLineWidth);
        let y = margin;
        
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 7; // Line spacing
        });
        
        doc.save('notes.pdf');
        setIsDropdownOpen(false);
      } catch (error) {
        console.error('Error creating PDF:', error);
        alert('Error creating PDF. Please try again.');
      } finally {
        setTimeout(() => setIsDownloading(false), 1000);
      }
    }
  }, [isDownloading]);

  const ToolButton: React.FC<{onClick: () => void, children: React.ReactNode, ariaLabel: string}> = ({onClick, children, ariaLabel}) => (
      <button 
        onClick={onClick}
        aria-label={ariaLabel}
        className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500">
        {children}
      </button>
  );

  return (
    <div className="h-full flex flex-col bg-gray-800 rounded-2xl shadow-2xl p-4 notes-container">
      <header className="flex justify-between items-center mb-2 flex-shrink-0">
        <h2 className="text-lg font-semibold text-cyan-400">Notes</h2>
        <div className="flex items-center gap-2" ref={wrapperRef}>
          <ToolButton onClick={handleCopy} ariaLabel={isCopied ? 'Copied to clipboard' : 'Copy notes to clipboard'}>
            {isCopied ? <CheckIcon /> : <CopyIcon />}
          </ToolButton>
          
          <div className="relative">
            <ToolButton onClick={() => setIsDropdownOpen(prev => !prev)} ariaLabel="Download notes">
                <DownloadIcon />
            </ToolButton>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-gray-700 rounded-md shadow-xl z-20 overflow-hidden border border-gray-600">
                <ul className="text-sm text-gray-200">
                  <li 
                    onClick={handleDownloadTxt} 
                    className={`px-4 py-2 hover:bg-cyan-600 cursor-pointer transition-colors ${isDownloading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    as .txt {isDownloading ? '⏳' : ''}
                  </li>
                  <li 
                    onClick={handleDownloadDoc} 
                    className={`px-4 py-2 hover:bg-cyan-600 cursor-pointer transition-colors ${isDownloading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    as .docx* {isDownloading ? '⏳' : ''}
                  </li>
                  <li 
                    onClick={handleDownloadPdf} 
                    className={`px-4 py-2 hover:bg-cyan-600 cursor-pointer transition-colors ${isDownloading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    as .pdf {isDownloading ? '⏳' : ''}
                  </li>
                </ul>
                <div className="px-2 py-1 text-xs text-gray-400 border-t border-gray-600">
                  *May fallback to .html/.rtf
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <QuillToolbar />
      <div className="quill-wrapper">
         <div ref={editorRef} />
      </div>
    </div>
  );
};

export default Notes;