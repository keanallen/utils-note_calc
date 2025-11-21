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
  onInsertCalculationResult?: (insertFn: (result: string) => void) => void;
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


const Notes: React.FC<NotesProps> = ({ value, onChange, onFocus, onBlur, onInsertCalculationResult }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillInstance = useRef<any>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [autoInsertEnabled, setAutoInsertEnabled] = useState(false);
  
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
          toolbar: '#quill-toolbar',
          keyboard: {
            bindings: {
              'custom-up': {
                key: 'ArrowUp',
                handler: function(range: any) {
                  if (!this.quill || !range || range.index === 0) return true; // Let Quill handle if at start or no context
                  const [line] = this.quill.getLine(range.index);
                  if (line && line.prev) {
                    const newIndex = Math.max(0, line.prev.offset() + Math.min(range.index - line.offset(), line.prev.length() - 1));
                    this.quill.setSelection(newIndex);
                    // Update cursor position in React state
                    setTimeout(() => {
                      if (this.quill) {
                        const selection = this.quill.getSelection();
                        if (selection) {
                          setCursorPosition(selection.index);
                        }
                      }
                    }, 0);
                    return false;
                  }
                  return true;
                }
              },
              'custom-down': {
                key: 'ArrowDown',
                handler: function(range: any) {
                  if (!this.quill || !range) return true;
                  const [line] = this.quill.getLine(range.index);
                  if (line && line.next) {
                    const newIndex = line.next.offset() + Math.min(range.index - line.offset(), line.next.length() - 1);
                    this.quill.setSelection(newIndex);
                    // Update cursor position in React state
                    setTimeout(() => {
                      if (this.quill) {
                        const selection = this.quill.getSelection();
                        if (selection) {
                          setCursorPosition(selection.index);
                        }
                      }
                    }, 0);
                    return false;
                  }
                  return true;
                }
              },
              'custom-left': {
                key: 'ArrowLeft',
                handler: function(range: any) {
                  if (!this.quill) return true;
                  // Let Quill handle left arrow, then update our cursor position
                  setTimeout(() => {
                    if (this.quill) {
                      const selection = this.quill.getSelection();
                      if (selection) {
                        setCursorPosition(selection.index);
                      }
                    }
                  }, 0);
                  return true; // Let Quill handle the movement
                }
              },
              'custom-right': {
                key: 'ArrowRight',
                handler: function(range: any) {
                  if (!this.quill) return true;
                  // Let Quill handle right arrow, then update our cursor position
                  setTimeout(() => {
                    if (this.quill) {
                      const selection = this.quill.getSelection();
                      if (selection) {
                        setCursorPosition(selection.index);
                      }
                    }
                  }, 0);
                  return true; // Let Quill handle the movement
                }
              },
              'custom-enter': {
                key: 'Enter',
                handler: function(range: any) {
                  if (!this.quill) return true;
                  // Let Quill handle enter, then update our cursor position
                  setTimeout(() => {
                    if (this.quill) {
                      const selection = this.quill.getSelection();
                      if (selection) {
                        setCursorPosition(selection.index);
                      }
                    }
                  }, 0);
                  return true; // Let Quill handle the newline
                }
              }
            }
          }
        },
        placeholder: 'Type your notes here...',
      });

      // Set initial content if available
      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }
      
      // Track cursor position changes
      quill.on('selection-change', (range) => {
        if (range) {
          setCursorPosition(range.index);
          if (onFocus) {
            onFocus();
          }
        } else if (onBlur) {
          onBlur();
        }
      });

      // Also track cursor position on text changes to keep it current
      quill.on('text-change', (_delta, _oldDelta, source) => {
        if (source === 'user') {
          onChange(quill.root.innerHTML);
          // Update cursor position after text changes with a slight delay to ensure Quill has updated
          setTimeout(() => {
            const selection = quill.getSelection();
            if (selection) {
              setCursorPosition(selection.index);
            }
          }, 0);
        }
      });

      // Additional event listeners for better cursor tracking
      quill.root.addEventListener('keyup', () => {
        setTimeout(() => {
          const selection = quill.getSelection();
          if (selection) {
            setCursorPosition(selection.index);
          }
        }, 0);
      });

      quill.root.addEventListener('click', () => {
        setTimeout(() => {
          const selection = quill.getSelection();
          if (selection) {
            setCursorPosition(selection.index);
          }
        }, 0);
      });
      
      quillInstance.current = quill;
    }
  }, [value, onChange, onFocus, onBlur]);

  // Register the insert function with the parent component whenever autoInsertEnabled changes
  useEffect(() => {
    if (onInsertCalculationResult && quillInstance.current && autoInsertEnabled !== null) {
      onInsertCalculationResult((result: string) => {
        if (autoInsertEnabled && quillInstance.current) {
          // Get the current selection/cursor position from Quill
          const selection = quillInstance.current.getSelection();
          let insertIndex;
          
          if (selection && selection.length === 0) {
            // User has cursor positioned somewhere, use that exact position
            insertIndex = selection.index;
          } else if (selection && selection.length > 0) {
            // User has text selected, replace the selection
            insertIndex = selection.index;
            // First delete the selected text
            quillInstance.current.deleteText(selection.index, selection.length, 'user');
          } else {
            // No selection, use the stored cursor position as fallback
            insertIndex = cursorPosition;
          }
          
          // Insert the calculation result at the determined position
          quillInstance.current.insertText(insertIndex, ` = ${result}`, 'user');
          
          // Move cursor to end of inserted text
          const newCursorPos = insertIndex + ` = ${result}`.length;
          quillInstance.current.setSelection(newCursorPos);
          setCursorPosition(newCursorPos);
        }
      });
    }
  }, [onInsertCalculationResult, autoInsertEnabled, cursorPosition]);

  const handleCopy = useCallback(async () => {
    if (quillInstance.current) {
      try {
        // Get both HTML content and plain text
        const htmlContent = quillInstance.current.root.innerHTML;
        const plainText = quillInstance.current.getText();
        
        // Convert HTML to Markdown-like format for better chat app compatibility
        const formatForChatApps = (html: string): string => {
          // Create a temporary element to parse HTML
          const tempElement = document.createElement('div');
          tempElement.innerHTML = html;
          
          // Convert HTML elements to chat-friendly formatting
          const processNode = (node: Node): string => {
            if (node.nodeType === Node.TEXT_NODE) {
              return node.textContent || '';
            }
            
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const tagName = element.tagName.toLowerCase();
              const children = Array.from(element.childNodes).map(processNode).join('');
              
              switch (tagName) {
                case 'strong':
                case 'b':
                  return `*${children}*`; // Bold for most chat apps
                case 'em':
                case 'i':
                  return `_${children}_`; // Italic for most chat apps
                case 'u':
                  return `__${children}__`; // Underline (Discord style)
                case 's':
                case 'strike':
                  return `~${children}~`; // Strikethrough for Discord/Slack
                case 'h1':
                  return `\n# ${children}\n`; // H1 heading
                case 'h2':
                  return `\n## ${children}\n`; // H2 heading
                case 'h3':
                  return `\n### ${children}\n`; // H3 heading
                case 'p':
                  return children + '\n'; // Paragraph with line break
                case 'br':
                  return '\n'; // Line break
                case 'blockquote':
                  return `\n> ${children}\n`; // Quote format
                case 'ul':
                case 'ol':
                  return '\n' + children; // List container
                case 'li':
                  return `• ${children}\n`; // List item with bullet
                case 'a':
                  const href = element.getAttribute('href');
                  return href ? `[${children}](${href})` : children; // Link format
                case 'code':
                  return `\`${children}\``; // Inline code
                case 'pre':
                  return `\`\`\`\n${children}\n\`\`\``; // Code block
                default:
                  return children;
              }
            }
            
            return '';
          };
          
          const formatted = Array.from(tempElement.childNodes).map(processNode).join('');
          
          // Clean up extra line breaks and spaces
          return formatted
            .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive line breaks
            .replace(/^\n+/, '') // Remove leading line breaks
            .replace(/\n+$/, '') // Remove trailing line breaks
            .trim();
        };
        
        // Format the content for chat apps
        const formattedText = formatForChatApps(htmlContent);
        
        // Use the modern Clipboard API with both formats
        if (navigator.clipboard && window.ClipboardItem) {
          // Try to copy both HTML and plain text versions
          const clipboardItems = new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([formattedText || plainText], { type: 'text/plain' })
          });
          
          await navigator.clipboard.write([clipboardItems]);
        } else {
          // Fallback to plain text only
          await navigator.clipboard.writeText(formattedText || plainText);
        }
        
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        
      } catch (error) {
        console.error('Copy failed:', error);
        // Fallback to simple text copy
        try {
          const plainText = quillInstance.current.getText();
          await navigator.clipboard.writeText(plainText);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (fallbackError) {
          console.error('Fallback copy also failed:', fallbackError);
          alert('Copy failed. Please select and copy the text manually.');
        }
      }
    }
  }, []);

  const handleToggleAutoInsert = useCallback(() => {
    setAutoInsertEnabled(!autoInsertEnabled);
  }, [autoInsertEnabled]);

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
          
          // Create RTF format with formatting as fallback
          const htmlContent = quillInstance.current.root.innerHTML;
          const text = quillInstance.current.getText();
          
          // Simple HTML to RTF conversion
          let rtfContent = text
            .replace(/\n/g, '\\par ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
          
          rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${rtfContent}}`;
          downloadFile('notes.rtf', rtfContent, 'application/rtf');
          alert('DOCX export not available. Downloaded as RTF instead. You can open this in Word to convert to DOCX.');
          return;
        }
        
        // Get the formatted content from Quill
        const delta = quillInstance.current.getContents();
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docxLib;
        
        // Convert Delta format to DOCX paragraphs
        const paragraphs: any[] = [];
        let currentRuns: any[] = [];
        
        delta.ops?.forEach((op: any) => {
          if (typeof op.insert === 'string') {
            const text = op.insert;
            const lines = text.split('\n');
            
            lines.forEach((line, index) => {
              if (line.length > 0 || index === 0) {
                // Create text run with formatting
                const runOptions: any = { text: line };
                
                if (op.attributes) {
                  if (op.attributes.bold) runOptions.bold = true;
                  if (op.attributes.italic) runOptions.italics = true;
                  if (op.attributes.underline) runOptions.underline = {};
                  if (op.attributes.strike) runOptions.strike = true;
                }
                
                currentRuns.push(new TextRun(runOptions));
              }
              
              // If we hit a newline or it's the last line, create a paragraph
              if (index > 0 || (index === lines.length - 1 && text.endsWith('\n'))) {
                const paragraphOptions: any = { children: currentRuns.length > 0 ? currentRuns : [new TextRun('')] };
                
                // Check for heading formatting
                if (op.attributes?.header) {
                  const headerLevel = parseInt(op.attributes.header);
                  if (headerLevel === 1) paragraphOptions.heading = HeadingLevel.HEADING_1;
                  else if (headerLevel === 2) paragraphOptions.heading = HeadingLevel.HEADING_2;
                  else if (headerLevel === 3) paragraphOptions.heading = HeadingLevel.HEADING_3;
                }
                
                paragraphs.push(new Paragraph(paragraphOptions));
                currentRuns = [];
              }
            });
          }
        });
        
        // If there are remaining runs, add them as a paragraph
        if (currentRuns.length > 0) {
          paragraphs.push(new Paragraph({ children: currentRuns }));
        }
        
        // Ensure we have at least one paragraph
        if (paragraphs.length === 0) {
          paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
        }
        
        // Create a new document using the docx library
        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs
          }]
        });
        
        // Generate and download the document
        const blob = await Packer.toBlob(doc);
        downloadFile('notes.docx', blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        
      } catch (error) {
        console.error('Error creating document:', error);
        // Fallback to HTML download with better formatting
        console.log('Falling back to HTML download');
        const htmlContent = quillInstance.current.root.innerHTML;
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Notes</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
                p { margin: 0 0 1em 0; }
                h1, h2, h3 { margin: 1.5em 0 0.5em 0; color: #2c3e50; }
                h1 { font-size: 2em; border-bottom: 2px solid #3498db; padding-bottom: 0.3em; }
                h2 { font-size: 1.5em; border-bottom: 1px solid #bdc3c7; padding-bottom: 0.2em; }
                h3 { font-size: 1.2em; }
                strong { font-weight: bold; }
                em { font-style: italic; }
                u { text-decoration: underline; }
                s { text-decoration: line-through; }
                blockquote { 
                  margin: 1em 0; 
                  padding-left: 1.5em; 
                  border-left: 4px solid #3498db; 
                  color: #666; 
                  font-style: italic; 
                }
                ul, ol { margin: 1em 0; padding-left: 2em; }
                li { margin: 0.5em 0; }
                a { color: #3498db; text-decoration: none; }
                a:hover { text-decoration: underline; }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `;
        downloadFile('notes.html', fullHtml, 'text/html');
        alert('DOCX export failed. Downloaded as styled HTML instead. You can open this in Word to convert to DOCX.');
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
        
        // Get formatted content from Quill instead of just plain text
        const htmlContent = quillInstance.current.root.innerHTML;
        
        // Create a temporary element to parse HTML and extract formatted text
        const tempElement = document.createElement('div');
        tempElement.innerHTML = htmlContent;
        
        // Better text handling for PDF with basic formatting support
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxLineWidth = pageWidth - (margin * 2);
        let y = margin;
        const lineHeight = 7;
        
        // Process each element in the HTML
        const processElement = (element: Element, isBold = false, isItalic = false) => {
          if (element.nodeType === Node.TEXT_NODE) {
            const text = element.textContent || '';
            if (text.trim()) {
              const lines = doc.splitTextToSize(text, maxLineWidth);
              lines.forEach((line: string) => {
                if (y > pageHeight - margin) {
                  doc.addPage();
                  y = margin;
                }
                
                // Set font style based on formatting
                if (isBold && isItalic) {
                  doc.setFont("helvetica", "bolditalic");
                } else if (isBold) {
                  doc.setFont("helvetica", "bold");
                } else if (isItalic) {
                  doc.setFont("helvetica", "italic");
                } else {
                  doc.setFont("helvetica", "normal");
                }
                
                doc.text(line, margin, y);
                y += lineHeight;
              });
            }
          } else {
            const tagName = element.tagName?.toLowerCase();
            const newIsBold = isBold || tagName === 'strong' || tagName === 'b';
            const newIsItalic = isItalic || tagName === 'em' || tagName === 'i';
            
            // Handle headings with larger font size
            if (tagName?.startsWith('h')) {
              if (y > pageHeight - margin - 10) {
                doc.addPage();
                y = margin;
              }
              y += 5; // Extra space before heading
              doc.setFontSize(tagName === 'h1' ? 18 : tagName === 'h2' ? 16 : 14);
              doc.setFont("helvetica", "bold");
              
              const text = element.textContent || '';
              const lines = doc.splitTextToSize(text, maxLineWidth);
              lines.forEach((line: string) => {
                doc.text(line, margin, y);
                y += lineHeight + 2;
              });
              
              doc.setFontSize(12); // Reset to normal size
              y += 3; // Extra space after heading
            } else if (tagName === 'p' || tagName === 'div') {
              // Process paragraph children
              Array.from(element.childNodes).forEach(child => {
                processElement(child as Element, newIsBold, newIsItalic);
              });
              y += lineHeight; // Extra space after paragraph
            } else {
              // Process other elements recursively
              Array.from(element.childNodes).forEach(child => {
                processElement(child as Element, newIsBold, newIsItalic);
              });
            }
          }
        };
        
        // If no formatted content, fall back to plain text
        if (!htmlContent.trim() || htmlContent === '<p><br></p>') {
          const text = quillInstance.current.getText();
          const lines = doc.splitTextToSize(text, maxLineWidth);
          lines.forEach((line: string) => {
            if (y > pageHeight - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(line, margin, y);
            y += lineHeight;
          });
        } else {
          // Process the formatted content
          Array.from(tempElement.childNodes).forEach(child => {
            processElement(child as Element);
          });
        }
        
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

  const ToolButton: React.FC<{onClick: () => void, children: React.ReactNode, ariaLabel: string, className?: string}> = ({onClick, children, ariaLabel, className = ''}) => (
      <button 
        onClick={onClick}
        aria-label={ariaLabel}
        className={`p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className}`}>
        {children}
      </button>
  );

  return (
    <div className="h-full flex flex-col bg-gray-800 rounded-2xl shadow-2xl p-4 notes-container">
      <header className="flex justify-between items-center mb-2 shrink-0">
        <h2 className="text-lg font-semibold text-cyan-400">Notes</h2>
        <div className="flex items-center gap-3" ref={wrapperRef}>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300 font-medium">Auto Insert</label>
            <button
              onClick={handleToggleAutoInsert}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                autoInsertEnabled ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
              role="switch"
              aria-checked={autoInsertEnabled}
              aria-label={autoInsertEnabled ? 'Disable auto-insert calculation results' : 'Enable auto-insert calculation results'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoInsertEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
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