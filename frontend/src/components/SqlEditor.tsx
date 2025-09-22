import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your SQL query here...',
  rows = 10,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSyntaxHighlighting, setShowSyntaxHighlighting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Toggle syntax highlighting when there's content
  useEffect(() => {
    setShowSyntaxHighlighting(value.trim().length > 0 && !isFocused);
  }, [value, isFocused]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSyntaxHighlighting(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value.trim().length > 0) {
      setShowSyntaxHighlighting(true);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Syntax highlighting overlay - positioned exactly over textarea */}
      {showSyntaxHighlighting && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            pointerEvents: 'none',
            overflow: 'hidden',
            borderRadius: '12px',
            border: '2px solid transparent',
          }}
        >
          <div
            style={{
              padding: '25px',
              fontSize: '15px',
              lineHeight: '1.6',
              fontFamily: 'Courier New, monospace',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            <SyntaxHighlighter
              language="sql"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: 0,
                background: 'transparent',
                fontSize: '15px',
                lineHeight: '1.6',
                fontFamily: 'Courier New, monospace',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
              showLineNumbers={false}
              wrapLines={true}
              wrapLongLines={true}
            >
              {value || placeholder}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {/* Actual textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '25px',
          border: isFocused ? '2px solid #6f42c1' : '2px solid #e1e5e9',
          fontFamily: 'Courier New, monospace',
          fontSize: '15px',
          lineHeight: '1.6',
          resize: 'vertical',
          minHeight: '250px',
          outline: 'none',
          backgroundColor: showSyntaxHighlighting ? 'transparent' : 'white',
          color: showSyntaxHighlighting ? 'transparent' : '#2c3e50',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: 2,
          boxShadow: isFocused
            ? '0 0 0 3px rgba(111, 66, 193, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.05)',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
        rows={rows}
      />
    </div>
  );
};

export default SqlEditor;
