# API Design

## 🌐 API Overview

Phil's Project provides a RESTful API for SQL database operations, enabling frontend applications to execute queries, retrieve table information, and manage database interactions securely.

## 🏗️ API Architecture

### Base URL
```
http://localhost:5001/api/sql
```

### Content Type
- **Request**: `application/json`
- **Response**: `application/json`

### HTTP Methods
- **GET**: Retrieve data (tables, schemas)
- **POST**: Execute operations (SQL queries)

## 📋 API Endpoints

### 1. **Execute SQL Query**
**Endpoint**: `POST /api/sql/execute`

**Purpose**: Execute arbitrary SQL queries against the database

**Request Body**:
```json
{
  "query": "SELECT * FROM customer LIMIT 5"
}
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | SQL query to execute |

**Response Format**:

**Success Response (SELECT queries)**:
```json
{
  "success": true,
  "data": [
    {
      "customerid": 1,
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com"
    }
  ],
  "columns": ["customerid", "firstname", "lastname", "email"],
  "row_count": 1,
  "execution_time": "0.045s",
  "query": "SELECT * FROM customer LIMIT 5"
}
```

**Success Response (Non-SELECT queries)**:
```json
{
  "success": true,
  "message": "Query executed successfully",
  "affected_rows": 5,
  "execution_time": "0.023s",
  "query": "INSERT INTO customer (firstname, lastname) VALUES ('Jane', 'Smith')"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Table 'phil_project.nonexistent' doesn't exist",
  "message": "Query execution failed",
  "query": "SELECT * FROM nonexistent"
}
```

### 2. **List Tables**
**Endpoint**: `GET /api/sql/tables`

**Purpose**: Retrieve list of all database tables

**Request**: No parameters required

**Response**:
```json
{
  "success": true,
  "tables": [
    {
      "name": "customer",
      "type": "BASE TABLE",
      "rows": 50
    },
    {
      "name": "product",
      "type": "BASE TABLE", 
      "rows": 50
    }
  ],
  "count": 6
}
```

### 3. **Get Table Schema**
**Endpoint**: `GET /api/sql/schema/{table_name}`

**Purpose**: Retrieve detailed schema information for a specific table

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| table_name | string | Yes | Name of the table |

**Response**:
```json
{
  "success": true,
  "table_name": "customer",
  "columns": [
    {
      "field": "customerid",
      "type": "int",
      "null": "NO",
      "key": "PRI",
      "default": null,
      "extra": "auto_increment"
    },
    {
      "field": "firstname",
      "type": "varchar(50)",
      "null": "NO",
      "key": "",
      "default": null,
      "extra": ""
    }
  ],
  "indexes": [
    {
      "name": "PRIMARY",
      "columns": ["customerid"],
      "unique": true
    }
  ],
  "foreign_keys": []
}
```

## 🔒 Security Design

### Input Validation

#### SQL Query Validation
```python
def is_safe_query(query):
    """Validate SQL query for security"""
    dangerous_keywords = [
        'DROP DATABASE', 'DROP SCHEMA', 'TRUNCATE',
        'DELETE FROM', 'UPDATE', 'ALTER TABLE',
        'CREATE TABLE', 'CREATE DATABASE'
    ]
    
    query_upper = query.upper().strip()
    for keyword in dangerous_keywords:
        if keyword in query_upper:
            return False
    return True
```

#### Request Validation
- **JSON Schema**: Validate request structure
- **Query Length**: Limit query length to prevent abuse
- **Parameter Sanitization**: Clean input parameters
- **SQL Injection**: Use parameterized queries

### Error Handling

#### Error Classification
1. **Validation Errors** (400): Invalid input or request format
2. **Security Errors** (400): Potentially unsafe queries
3. **Database Errors** (500): SQL execution failures
4. **System Errors** (500): Internal server errors

#### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly description",
  "query": "Original query (if applicable)",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📊 Response Design

### Standard Response Structure

#### Success Response
```json
{
  "success": true,
  "data": {},           // Query results (for SELECT)
  "message": "",        // Success message (for non-SELECT)
  "metadata": {         // Additional information
    "execution_time": "0.045s",
    "row_count": 5,
    "affected_rows": 0
  },
  "query": "SELECT * FROM customer"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error details",
  "message": "User-friendly message",
  "query": "SELECT * FROM customer",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Data Formatting

#### Column Information
```json
{
  "columns": [
    {
      "name": "customerid",
      "type": "int",
      "nullable": false,
      "primary_key": true
    }
  ]
}
```

#### Row Data
```json
{
  "data": [
    {
      "customerid": 1,
      "firstname": "John",
      "lastname": "Doe"
    }
  ]
}
```

## 🚀 Performance Design

### Query Execution

#### Execution Flow
1. **Input Validation** (1-5ms)
2. **Security Check** (1-2ms)
3. **Query Execution** (10-1000ms)
4. **Result Processing** (5-50ms)
5. **Response Formatting** (1-10ms)

#### Performance Metrics
- **Response Time**: < 2 seconds for most queries
- **Throughput**: 100+ queries per minute
- **Memory Usage**: < 100MB per request
- **Database Connections**: Connection pooling

### Caching Strategy
- **No Caching**: Real-time data requirements
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Index usage and query planning

## 🔄 Error Handling

### Error Types

#### 1. **Validation Errors** (400)
```json
{
  "success": false,
  "error": "No query provided",
  "message": "Please provide a SQL query in the request body"
}
```

#### 2. **Security Errors** (400)
```json
{
  "success": false,
  "error": "Potentially unsafe query",
  "message": "Query contains potentially dangerous operations"
}
```

#### 3. **Database Errors** (500)
```json
{
  "success": false,
  "error": "Table 'phil_project.nonexistent' doesn't exist",
  "message": "Query execution failed"
}
```

#### 4. **System Errors** (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

### Error Recovery
- **Transaction Rollback**: Automatic rollback on errors
- **Connection Cleanup**: Proper connection management
- **Logging**: Comprehensive error logging
- **User Feedback**: Clear error messages

## 📝 API Documentation

### OpenAPI Specification
```yaml
openapi: 3.0.0
info:
  title: Phil's Project SQL API
  version: 1.0.0
  description: RESTful API for SQL database operations

paths:
  /api/sql/execute:
    post:
      summary: Execute SQL query
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: SQL query to execute
              required:
                - query
      responses:
        '200':
          description: Query executed successfully
        '400':
          description: Invalid request or unsafe query
        '500':
          description: Database or server error
```

### Example Usage

#### cURL Examples
```bash
# Execute a SELECT query
curl -X POST http://localhost:5001/api/sql/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM customer LIMIT 5"}'

# List all tables
curl http://localhost:5001/api/sql/tables

# Get table schema
curl http://localhost:5001/api/sql/schema/customer
```

#### JavaScript Examples
```javascript
// Execute SQL query
const response = await fetch('/api/sql/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'SELECT * FROM customer LIMIT 5'
  })
});

const result = await response.json();
console.log(result.data);
```

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=phil_project

# API Configuration
FLASK_ENV=development
FLASK_DEBUG=True
API_RATE_LIMIT=100
MAX_QUERY_LENGTH=10000
```

### API Limits
- **Query Length**: 10,000 characters maximum
- **Result Rows**: 1,000 rows maximum per query
- **Rate Limiting**: 100 requests per minute per IP
- **Timeout**: 30 seconds maximum execution time

## 🧪 Testing

### Test Cases

#### 1. **Valid Queries**
- SELECT statements with various clauses
- JOIN operations
- Aggregate functions
- Subqueries

#### 2. **Invalid Queries**
- Syntax errors
- Non-existent tables
- Invalid column names
- Constraint violations

#### 3. **Security Tests**
- SQL injection attempts
- Dangerous operations
- Input validation
- Error handling

#### 4. **Performance Tests**
- Large result sets
- Complex queries
- Concurrent requests
- Memory usage

### Test Data
- **Sample Queries**: Predefined test queries
- **Mock Data**: Test database with known data
- **Edge Cases**: Boundary conditions and error scenarios
- **Load Testing**: High-volume request testing

---

*This API design provides a secure, efficient, and user-friendly interface for SQL database operations in Phil's Project.*
