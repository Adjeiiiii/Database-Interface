import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { type SqlResponse } from '../api/sqlApi';

interface SqlResultProps {
  result: SqlResponse;
}

const SqlResult: React.FC<SqlResultProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginTop: '20px',
        border: '1px solid #e1e5e9',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e1e5e9',
        }}
      >
        <h3
          style={{
            margin: '0',
            color: '#1a1a1a',
            fontSize: '1.5rem',
            fontWeight: '600',
          }}
        >
          Query Result
        </h3>
        <div
          style={{
            display: 'flex',
            gap: '15px',
            fontSize: '14px',
            color: '#6c757d',
          }}
        >
          {result.execution_time && (
            <span
              style={{
                background: '#e9ecef',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: '500',
              }}
            >
              ⏱️ {result.execution_time}
            </span>
          )}
          {result.success && result.row_count !== undefined && (
            <span
              style={{
                background: '#d4edda',
                color: '#155724',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: '500',
              }}
            >
              📊 {result.row_count} rows
            </span>
          )}
          {result.success && result.affected_rows !== undefined && (
            <span
              style={{
                background: '#cce5ff',
                color: '#004085',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: '500',
              }}
            >
              ✏️ {result.affected_rows} affected
            </span>
          )}
        </div>
      </div>

      {result.success ? (
        <div style={{ padding: '20px' }}>
          {result.data && result.data.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                <thead>
                  <tr>
                    {result.columns?.map((column, index) => (
                      <th
                        key={index}
                        style={{
                          background:
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '15px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      style={{
                        backgroundColor:
                          rowIndex % 2 === 0 ? '#f8f9fa' : 'white',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {result.columns?.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid #dee2e6',
                            color: '#212529',
                            fontSize: '13px',
                          }}
                        >
                          {row[column] !== null ? (
                            String(row[column])
                          ) : (
                            <span
                              style={{ color: '#6c757d', fontStyle: 'italic' }}
                            >
                              NULL
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6c757d',
                fontStyle: 'italic',
                fontSize: '16px',
              }}
            >
              ✅{' '}
              {result.message ||
                'Query executed successfully (no data returned)'}
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          <div
            style={{
              color: '#dc3545',
              fontWeight: '600',
              marginBottom: '10px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ❌ <strong>Error:</strong> {result.error}
          </div>
          {result.message && (
            <div
              style={{ color: '#6c757d', fontSize: '14px', marginTop: '8px' }}
            >
              {result.message}
            </div>
          )}
        </div>
      )}

      {/* Show the executed query */}
      {result.query && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e1e5e9',
          }}
        >
          <h4
            style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '14px' }}
          >
            Executed Query:
          </h4>
          <SyntaxHighlighter
            language="sql"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '15px',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'Courier New, monospace',
            }}
            showLineNumbers={false}
          >
            {result.query}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default SqlResult;
