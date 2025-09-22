# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                     │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Port 5173)                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   SQL Editor    │  │  Results Table  │  │  Table Browser  │ │
│  │                 │  │                 │  │                 │ │
│  │ • Syntax High-  │  │ • Data Display  │  │ • Schema Info   │ │
│  │   lighting      │  │ • Pagination    │  │ • Column Types  │ │
│  │ • Auto-format   │  │ • Export        │  │ • Relationships│ │
│  │ • Query History │  │ • Error Display │  │ • Quick Insert  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                │ JSON API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Flask Backend (Port 5001)                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   API Gateway   │  │  Business Logic │  │  Security Layer │ │
│  │                 │  │                 │  │                 │ │
│  │ • Route Handler │  │ • Query Parser  │  │ • Input Valid.  │ │
│  │ • Request Val.  │  │ • Result Format │  │ • SQL Injection │ │
│  │ • Response Gen. │  │ • Error Handler │  │ • Auth Check    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ SQL Queries
                                │ Connection Pool
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  MySQL Database (Port 3306)                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Schema Mgmt   │  │   Data Storage  │  │   Constraints   │ │
│  │                 │  │                 │  │                 │ │
│  │ • Table Def.    │  │ • Sample Data   │  │ • Foreign Keys  │ │
│  │ • Indexes       │  │ • Transactions  │  │ • Check Const.  │ │
│  │ • Relationships │  │ • ACID Props    │  │ • Data Integrity│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### 1. **Query Execution Flow**
```
User Input → Frontend Validation → API Request → Backend Processing → Database Query → Result Processing → Frontend Display
```

### 2. **Error Handling Flow**
```
Error Occurrence → Error Classification → Error Processing → User-Friendly Message → Frontend Display
```

### 3. **Security Flow**
```
User Input → Input Sanitization → SQL Injection Check → Query Validation → Safe Execution
```

## 🏢 Component Architecture

### Frontend Components

#### **SqlInterface.tsx** (Main Container)
- **Purpose**: Main application container and state management
- **Responsibilities**:
  - Query state management
  - Tab navigation (Query/Tables)
  - Sample query management
  - API integration coordination

#### **SqlEditor.tsx** (Query Input)
- **Purpose**: SQL query input with syntax highlighting
- **Responsibilities**:
  - Text input handling
  - Syntax highlighting overlay
  - Focus/blur state management
  - Query formatting integration

#### **SqlResult.tsx** (Results Display)
- **Purpose**: Query results visualization
- **Responsibilities**:
  - Table data rendering
  - Error message display
  - Execution metrics display
  - Query syntax highlighting

### Backend Components

#### **app.py** (Main Application)
- **Purpose**: Flask application and API endpoints
- **Responsibilities**:
  - Route handling
  - Request processing
  - Response formatting
  - Error handling

#### **Database Layer**
- **Purpose**: Data persistence and query execution
- **Responsibilities**:
  - Connection management
  - Query execution
  - Transaction handling
  - Data integrity

## 🔌 API Architecture

### RESTful Design Principles
- **Stateless**: Each request contains all necessary information
- **Resource-based**: URLs represent resources, not actions
- **HTTP Methods**: Proper use of GET, POST, PUT, DELETE
- **JSON**: Consistent JSON request/response format

### API Endpoints Structure
```
/api/sql/
├── execute (POST)     # Execute SQL queries
├── tables (GET)       # List all tables
└── schema/{table} (GET) # Get table schema
```

### Request/Response Format
```json
// Request
{
  "query": "SELECT * FROM customer LIMIT 5"
}

// Response
{
  "success": true,
  "data": [...],
  "columns": [...],
  "row_count": 5,
  "execution_time": "0.045s",
  "query": "SELECT * FROM customer LIMIT 5"
}
```

## 🗄️ Database Architecture

### Schema Design
- **Normalized Structure**: 3NF compliance for data integrity
- **Referential Integrity**: Foreign key constraints
- **Indexing Strategy**: Optimized for common query patterns
- **Data Types**: Appropriate MySQL data types

### Table Relationships
```
customer (1) ←→ (M) orders (1) ←→ (M) orderitem
    ↓                    ↓
    └── (1) ←→ (M) acct ←┘

supplier (1) ←→ (M) product (1) ←→ (M) orderitem
    ↓
    └── (1) ←→ (M) whouse
```

### Data Lifecycle
1. **Initialization**: Schema creation from `init.sql`
2. **Seeding**: Sample data insertion from `seed_data.sql`
3. **Runtime**: Query execution and data manipulation
4. **Cleanup**: Ephemeral storage, fresh data on restart

## 🚀 Deployment Architecture

### Development Environment
```
Developer Machine
├── Docker Desktop
├── MySQL Container (Port 3306)
├── Flask Container (Port 5001)
└── React Dev Server (Port 5173)
```

### Production Environment
```
Production Server
├── Docker Compose
├── MySQL Container
├── Flask Container
└── Nginx (Static Files + Proxy)
```

## 🔒 Security Architecture

### Defense in Depth
1. **Input Validation**: Frontend and backend validation
2. **SQL Injection Prevention**: Parameterized queries and validation
3. **Error Handling**: Safe error messages without information leakage
4. **Request Validation**: JSON schema validation
5. **Response Sanitization**: Clean data before sending to frontend

### Security Layers
```
┌─────────────────────────────────────┐
│        Frontend Validation          │
├─────────────────────────────────────┤
│        API Input Validation         │
├─────────────────────────────────────┤
│        SQL Injection Check          │
├─────────────────────────────────────┤
│        Database Security            │
└─────────────────────────────────────┘
```

## 📊 Performance Architecture

### Caching Strategy
- **Query Results**: No caching (real-time data)
- **Static Assets**: Browser caching
- **API Responses**: No caching (always fresh)

### Optimization Techniques
- **Database Indexing**: Optimized for common queries
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Efficient SQL execution
- **Frontend Bundling**: Optimized JavaScript bundles

## 🔄 Scalability Considerations

### Horizontal Scaling
- **Stateless Backend**: Can run multiple instances
- **Database Scaling**: Read replicas for query distribution
- **Load Balancing**: Multiple backend instances

### Vertical Scaling
- **Resource Allocation**: CPU and memory optimization
- **Database Tuning**: MySQL configuration optimization
- **Container Resources**: Docker resource limits

## 📈 Monitoring and Observability

### Metrics Collection
- **Query Performance**: Execution time tracking
- **Error Rates**: Failed query monitoring
- **User Activity**: Query frequency and patterns
- **System Health**: Container and database status

### Logging Strategy
- **Application Logs**: Query execution and errors
- **Access Logs**: API request/response logging
- **Error Logs**: Exception and error tracking
- **Audit Logs**: Security and compliance logging

---

*This system architecture document provides the foundation for understanding and extending Phil's Project.*
