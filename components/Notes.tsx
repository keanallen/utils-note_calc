import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CopyIcon, DownloadIcon, CheckIcon } from './icons';

// Declare Quill and other libraries from window object for TypeScript
declare const Quill: any;
declare const jsPDF: any;
declare const htmlToDocx: any;

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
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };
  
  const handleDownloadTxt = useCallback(() => {
    if (quillInstance.current) {
      const text = quillInstance.current.getText();
      downloadFile('notes.txt', text, 'text/plain;charset=utf-8');
    }
  }, []);

  const handleDownloadDoc = useCallback(async () => {
    if (quillInstance.current) {
        const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${quillInstance.current.root.innerHTML}</body></html>`;
        const fileBuffer = await htmlToDocx.asBlob(htmlContent);
        downloadFile('notes.docx', fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
  }, []);

  const handleDownloadPdf = useCallback(() => {
    if (quillInstance.current) {
      const doc = new jsPDF();
      const text = quillInstance.current.getText();
      const lines = doc.splitTextToSize(text, 180); // 180 is the width in the PDF
      doc.text(lines, 10, 10);
      doc.save('notes.pdf');
      setIsDropdownOpen(false);
    }
  }, []);

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
              <div className="absolute right-0 mt-2 w-36 bg-gray-700 rounded-md shadow-xl z-20 overflow-hidden border border-gray-600">
                <ul className="text-sm text-gray-200">
                    <li onClick={handleDownloadTxt} className="px-4 py-2 hover:bg-cyan-600 cursor-pointer transition-colors">as .txt</li>
                    <li onClick={handleDownloadDoc} className="px-4 py-2 hover:bg-cyan-600 cursor-pointer transition-colors">as .doc</li>
                    <li onClick={handleDownloadPdf} className="px-4 py-2 hover:bg-cyan-600 cursor-pointer transition-colors">as .pdf</li>
                </ul>
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