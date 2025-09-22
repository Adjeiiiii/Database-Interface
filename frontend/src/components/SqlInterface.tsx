import React, { useState, useEffect } from 'react';
import { sqlApi, type SqlResponse } from '../api/sqlApi';
import SqlEditor from './SqlEditor';
import SqlResult from './SqlResult';
import { formatSql } from '../utils/sqlFormatter';

interface SqlInterfaceProps {}

const SqlInterface: React.FC<SqlInterfaceProps> = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SqlResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'query' | 'tables'>('query');

  console.log('SqlInterface component rendered');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    const response = await sqlApi.getTables();
    if (response.success && response.tables) {
      setTables(response.tables);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await sqlApi.executeQuery(query);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to execute query',
        message: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResult(null);
  };

  const insertSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  const formatQuery = () => {
    const formatted = formatSql(query);
    setQuery(formatted);
  };

  const sampleQueries = [
    {
      title: '👥 View Customers',
      query: 'SELECT * FROM customer LIMIT 5',
      color: '#28a745',
    },
    {
      title: '💰 Expensive Products',
      query: 'SELECT * FROM product WHERE unitprice > 5',
      color: '#dc3545',
    },
    {
      title: '🛒 Customer Orders',
      query:
        'SELECT c.firstname, c.lastname, o.totalamount FROM customer c JOIN orders o ON c.customerid = o.customerid',
      color: '#007bff',
    },
    {
      title: '📊 Database Tables',
      query: 'SHOW TABLES',
      color: '#6f42c1',
    },
    {
      title: '🔍 Table Structure',
      query: 'DESCRIBE customer',
      color: '#fd7e14',
    },
    {
      title: '📈 Sales Summary',
      query:
        'SELECT COUNT(*) as total_orders, SUM(totalamount) as total_sales FROM orders',
      color: '#20c997',
    },
    {
      title: '⚡ Fast Selling Products',
      query: `SELECT 
    p.productid,
    p.productname,
    p.description,
    p.unitprice,
    p.quantityonhand,
    p.reorderlevel,
    s.suppliername,
    w.lastrestocked,
    DATEDIFF(CURRENT_DATE, w.lastrestocked) as days_since_restock,
    CASE 
        WHEN p.quantityonhand <= p.reorderlevel THEN 'HIGH DEMAND'
        WHEN p.quantityonhand <= (p.reorderlevel * 1.5) THEN 'MEDIUM DEMAND'
        ELSE 'LOW DEMAND'
    END as demand_level
FROM product p
JOIN supplier s ON p.supplierid = s.supplierid
LEFT JOIN whouse w ON p.productid = w.productid
WHERE p.quantityonhand <= (p.reorderlevel * 1.5)
ORDER BY 
    (p.quantityonhand / NULLIF(p.reorderlevel, 0)) ASC,
    w.lastrestocked DESC`,
      color: '#e83e8c',
    },
    {
      title: '🐌 Slow Selling Products',
      query: `SELECT 
    p.productid,
    p.productname,
    p.description,
    p.unitprice,
    p.quantityonhand,
    p.reorderlevel,
    s.suppliername,
    w.lastrestocked,
    DATEDIFF(CURRENT_DATE, w.lastrestocked) as days_since_restock,
    CASE 
        WHEN p.quantityonhand > (p.reorderlevel * 3) THEN 'SLOW MOVING'
        WHEN w.lastrestocked IS NULL THEN 'NEVER RESTOCKED'
        WHEN DATEDIFF(CURRENT_DATE, w.lastrestocked) > 30 THEN 'OVERSTOCKED'
        ELSE 'NORMAL'
    END as sales_velocity
FROM product p
JOIN supplier s ON p.supplierid = s.supplierid
LEFT JOIN whouse w ON p.productid = w.productid
WHERE p.quantityonhand > (p.reorderlevel * 2)
   OR w.lastrestocked IS NULL
   OR DATEDIFF(CURRENT_DATE, w.lastrestocked) > 30
ORDER BY 
    p.quantityonhand DESC,
    w.lastrestocked ASC`,
      color: '#6c757d',
    },
    {
      title: '👤 Current Customers (2023-2025)',
      query: `SELECT 
    customerid,
    firstname,
    lastname,
    businessname,
    email,
    phone,
    address,
    city,
    state,
    zipcode,
    joindate,
    YEAR(joindate) as join_year
FROM customer
WHERE joindate >= '2023-01-01' 
  AND joindate <= '2025-12-31'
ORDER BY joindate DESC`,
      color: '#17a2b8',
    },
    {
      title: '💳 Overdue Accounts',
      query: `SELECT 
    c.customerid,
    c.firstname,
    c.lastname,
    c.businessname,
    c.email,
    c.phone,
    a.orderid,
    a.amountdue,
    a.amountpaid,
    a.duedate,
    a.paymentstatus,
    o.orderdate,
    o.totalamount,
    o.status as order_status,
    DATEDIFF(CURRENT_DATE, a.duedate) as days_overdue
FROM customer c
JOIN acct a ON c.customerid = a.customerid
JOIN orders o ON a.orderid = o.orderid
WHERE a.paymentstatus = 'OVERDUE'
   OR (a.paymentstatus = 'UNPAID' AND a.duedate < CURRENT_DATE)
ORDER BY 
    a.duedate ASC,
    days_overdue DESC`,
      color: '#dc3545',
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1400px',
        padding: '20px',
        backgroundColor: 'white',
        minHeight: '100vh',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          marginBottom: '30px',
          borderBottom: '2px solid #e1e5e9',
          paddingBottom: '20px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            color: '#1a1a1a',
            margin: '0 0 20px 0',
            fontSize: '2.5rem',
            fontWeight: '400',
          }}
        >
          Giardini's Business Database Interface
        </h1>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <button
            style={{
              padding: '12px 24px',
              border: '2px solid #007bff',
              background: activeTab === 'query' ? '#007bff' : 'white',
              color: activeTab === 'query' ? 'white' : '#007bff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
            }}
            onClick={() => setActiveTab('query')}
          >
            Query Editor
          </button>
          <button
            style={{
              padding: '12px 24px',
              border: '2px solid #007bff',
              background: activeTab === 'tables' ? '#007bff' : 'white',
              color: activeTab === 'tables' ? 'white' : '#007bff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
            }}
            onClick={() => setActiveTab('tables')}
          >
            Tables ({tables.length})
          </button>
        </div>
      </div>

      {activeTab === 'query' && (
        <div style={{ marginBottom: '30px' }}>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              border: '1px solid #e1e5e9',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '25px',
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
                SQL Query Editor
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={clearQuery}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={formatQuery}
                  disabled={!query.trim()}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: !query.trim() ? 'not-allowed' : 'pointer',
                    backgroundColor: !query.trim() ? '#6c757d' : '#6f42c1',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>🎨</span>
                  Format SQL
                </button>
                <button
                  onClick={executeQuery}
                  disabled={loading || !query.trim()}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor:
                      loading || !query.trim() ? 'not-allowed' : 'pointer',
                    backgroundColor:
                      loading || !query.trim() ? '#6c757d' : '#28a745',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Executing...' : 'Execute Query'}
                </button>
              </div>
            </div>

            <SqlEditor
              value={query}
              onChange={setQuery}
              placeholder="Enter your SQL query here... (e.g., SELECT * FROM customer LIMIT 5)"
              rows={10}
            />

            <div
              style={{
                padding: '25px',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e1e5e9',
              }}
            >
              <h4
                style={{
                  margin: '0 0 20px 0',
                  color: '#1a1a1a',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                Sample Queries:
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '12px',
                }}
              >
                {sampleQueries.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => insertSampleQuery(sample.query)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8f9fa',
                      border: `2px solid ${sample.color}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#1a1a1a',
                      textAlign: 'left',
                      transition: 'all 0.3s ease',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: '600',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = sample.color;
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${sample.color}40`;
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.color = '#1a1a1a';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{sample.title}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        opacity: 0.8,
                        fontFamily: 'Courier New, monospace',
                      }}
                    >
                      {sample.query}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {result && <SqlResult result={result} />}
        </div>
      )}

      {activeTab === 'tables' && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            padding: '30px',
            border: '1px solid #e1e5e9',
          }}
        >
          <h3
            style={{
              margin: '0 0 30px 0',
              color: '#2c3e50',
              fontSize: '1.8rem',
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            Database Tables
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '25px',
            }}
          >
            {tables.map(table => (
              <TableCard key={table} tableName={table} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TableCard: React.FC<{ tableName: string }> = ({ tableName }) => {
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadSchema = async () => {
    setLoading(true);
    const response = await sqlApi.getTableSchema(tableName);
    if (response.success) {
      setSchema(response);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}
      >
        <h4 style={{ margin: '0', color: '#2c3e50', fontSize: '1.1rem' }}>
          {tableName}
        </h4>
        <button
          onClick={loadSchema}
          disabled={loading}
          style={{
            padding: '6px 12px',
            background: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '12px',
          }}
        >
          {loading ? 'Loading...' : 'View Schema'}
        </button>
      </div>

      {schema && (
        <div
          style={{
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '1px solid #dee2e6',
          }}
        >
          <p
            style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '14px' }}
          >
            <strong>Columns:</strong> {schema.column_count}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {schema.columns?.map((col: any, index: number) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  background: 'white',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                <span
                  style={{
                    fontWeight: '600',
                    color: '#2c3e50',
                    minWidth: '100px',
                  }}
                >
                  {col.field}
                </span>
                <span
                  style={{
                    color: '#6c757d',
                    fontFamily: 'Courier New, monospace',
                  }}
                >
                  {col.type}
                </span>
                {col.key && (
                  <span
                    style={{
                      background: '#28a745',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}
                  >
                    {col.key}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SqlInterface;
