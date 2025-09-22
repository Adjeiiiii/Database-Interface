# Security Design

## 🔒 Security Overview

Phil's Project implements a multi-layered security approach to protect against common web vulnerabilities while maintaining usability and functionality. The security design focuses on input validation, SQL injection prevention, and secure data handling.

## 🛡️ Security Layers

### 1. **Frontend Security**
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Secure data transmission

### 2. **API Security**
- Request validation
- SQL injection prevention
- Rate limiting
- Error handling without information leakage

### 3. **Database Security**
- Parameterized queries
- Connection security
- Data integrity constraints
- Access control

## 🔍 Threat Model

### Identified Threats

#### 1. **SQL Injection**
- **Risk**: High
- **Description**: Malicious SQL code injection through user input
- **Impact**: Data breach, data manipulation, system compromise
- **Mitigation**: Parameterized queries, input validation, query sanitization

#### 2. **Cross-Site Scripting (XSS)**
- **Risk**: Medium
- **Description**: Malicious script injection in user interface
- **Impact**: Session hijacking, data theft, user manipulation
- **Mitigation**: Input sanitization, output encoding, CSP headers

#### 3. **Cross-Site Request Forgery (CSRF)**
- **Risk**: Low
- **Description**: Unauthorized actions performed on behalf of authenticated users
- **Impact**: Unauthorized data modification
- **Mitigation**: CSRF tokens, same-origin policy

#### 4. **Information Disclosure**
- **Risk**: Medium
- **Description**: Sensitive information exposure through error messages
- **Impact**: System information leakage, attack surface expansion
- **Mitigation**: Generic error messages, proper logging

#### 5. **Denial of Service (DoS)**
- **Risk**: Medium
- **Description**: System overload through resource exhaustion
- **Impact**: Service unavailability, performance degradation
- **Mitigation**: Rate limiting, query timeouts, resource monitoring

## 🔐 Input Validation

### Frontend Validation

#### SQL Query Validation
```typescript
interface QueryValidation {
  minLength: number;
  maxLength: number;
  allowedKeywords: string[];
  blockedKeywords: string[];
  pattern: RegExp;
}

const queryValidation: QueryValidation = {
  minLength: 1,
  maxLength: 10000,
  allowedKeywords: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'SHOW', 'DESCRIBE'],
  blockedKeywords: ['DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE'],
  pattern: /^[a-zA-Z0-9\s\.,\(\)=<>!'\"]+$/
};
```

#### Input Sanitization
```typescript
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break SQL
    .substring(0, 10000); // Limit length
}
```

### Backend Validation

#### SQL Injection Prevention
```python
def is_safe_query(query: str) -> bool:
    """Validate SQL query for security"""
    dangerous_keywords = [
        'DROP DATABASE', 'DROP SCHEMA', 'TRUNCATE',
        'DELETE FROM', 'UPDATE', 'ALTER TABLE',
        'CREATE TABLE', 'CREATE DATABASE', 'GRANT',
        'REVOKE', 'EXEC', 'EXECUTE', 'SP_'
    ]
    
    query_upper = query.upper().strip()
    
    # Check for dangerous keywords
    for keyword in dangerous_keywords:
        if keyword in query_upper:
            return False
    
    # Check for SQL injection patterns
    injection_patterns = [
        r'union\s+select',
        r'insert\s+into',
        r'update\s+set',
        r'delete\s+from',
        r'drop\s+table',
        r'alter\s+table'
    ]
    
    for pattern in injection_patterns:
        if re.search(pattern, query_upper):
            return False
    
    return True
```

#### Request Validation
```python
def validate_request(data: dict) -> tuple[bool, str]:
    """Validate API request data"""
    if not data:
        return False, "No data provided"
    
    if 'query' not in data:
        return False, "Query parameter missing"
    
    query = data['query']
    if not isinstance(query, str):
        return False, "Query must be a string"
    
    if len(query.strip()) == 0:
        return False, "Query cannot be empty"
    
    if len(query) > 10000:
        return False, "Query too long"
    
    return True, "Valid request"
```

## 🚫 SQL Injection Prevention

### Parameterized Queries
```python
# Safe query execution using SQLAlchemy
def execute_safe_query(query: str, params: dict = None):
    """Execute query safely using parameterized queries"""
    try:
        # Use SQLAlchemy's text() function for raw SQL
        result = db.session.execute(text(query), params or {})
        return result
    except Exception as e:
        # Log error without exposing details
        logger.error(f"Query execution failed: {str(e)}")
        raise
```

### Query Whitelisting
```python
ALLOWED_QUERY_TYPES = [
    'SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'
]

def is_allowed_query_type(query: str) -> bool:
    """Check if query type is allowed"""
    query_upper = query.upper().strip()
    for allowed_type in ALLOWED_QUERY_TYPES:
        if query_upper.startswith(allowed_type):
            return True
    return False
```

### Input Escaping
```python
def escape_sql_input(input_str: str) -> str:
    """Escape potentially dangerous SQL characters"""
    if not isinstance(input_str, str):
        return str(input_str)
    
    # Escape common SQL injection characters
    escaped = input_str.replace("'", "''")
    escaped = escaped.replace('"', '""')
    escaped = escaped.replace('\\', '\\\\')
    
    return escaped
```

## 🔒 Authentication and Authorization

### Current Implementation
- **No Authentication**: Public API for development/demo purposes
- **IP-based Access**: Localhost only access
- **Rate Limiting**: Basic request throttling

### Future Security Enhancements
```python
# JWT-based authentication
from flask_jwt_extended import JWTManager, jwt_required

@app.route('/api/sql/execute', methods=['POST'])
@jwt_required()
def execute_sql():
    # Protected endpoint
    pass

# Role-based access control
def require_role(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.has_role(role):
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
```

## 🛡️ Data Protection

### Sensitive Data Handling
```python
# Data masking for sensitive information
def mask_sensitive_data(data: dict) -> dict:
    """Mask sensitive data in responses"""
    sensitive_fields = ['password', 'ssn', 'credit_card']
    
    masked_data = data.copy()
    for field in sensitive_fields:
        if field in masked_data:
            masked_data[field] = '***MASKED***'
    
    return masked_data
```

### Data Encryption
```python
# Database connection encryption
DATABASE_CONFIG = {
    'host': 'mysql',
    'port': 3306,
    'user': 'root',
    'password': 'password',
    'database': 'phil_project',
    'ssl_disabled': False,  # Enable SSL in production
    'ssl_verify_cert': True,
    'ssl_verify_identity': True
}
```

### Logging Security
```python
# Secure logging without sensitive data
import logging

def log_query_execution(query: str, user_id: str = None):
    """Log query execution without exposing sensitive data"""
    # Sanitize query for logging
    sanitized_query = sanitize_for_logging(query)
    
    logger.info(f"Query executed by user {user_id}: {sanitized_query}")

def sanitize_for_logging(query: str) -> str:
    """Remove sensitive data from query for logging"""
    # Remove potential sensitive data
    sensitive_patterns = [
        r'password\s*=\s*[\'"]\w+[\'"]',
        r'ssn\s*=\s*[\'"]\d+[\'"]',
        r'credit_card\s*=\s*[\'"]\d+[\'"]'
    ]
    
    sanitized = query
    for pattern in sensitive_patterns:
        sanitized = re.sub(pattern, '***SENSITIVE***', sanitized, flags=re.IGNORECASE)
    
    return sanitized
```

## 🚨 Error Handling Security

### Safe Error Messages
```python
def handle_database_error(error: Exception) -> dict:
    """Handle database errors without exposing sensitive information"""
    # Log full error for debugging
    logger.error(f"Database error: {str(error)}")
    
    # Return generic error message
    return {
        'success': False,
        'error': 'Query execution failed',
        'message': 'Please check your query syntax and try again'
    }
```

### Error Classification
```python
class SecurityError(Exception):
    """Security-related error"""
    pass

class ValidationError(Exception):
    """Input validation error"""
    pass

class DatabaseError(Exception):
    """Database operation error"""
    pass

def classify_error(error: Exception) -> str:
    """Classify error type for appropriate handling"""
    if isinstance(error, SecurityError):
        return "Security violation detected"
    elif isinstance(error, ValidationError):
        return "Invalid input provided"
    elif isinstance(error, DatabaseError):
        return "Database operation failed"
    else:
        return "An unexpected error occurred"
```

## 🔍 Security Monitoring

### Audit Logging
```python
# Security event logging
def log_security_event(event_type: str, details: dict):
    """Log security-related events"""
    security_logger.info({
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': event_type,
        'details': details,
        'ip_address': request.remote_addr,
        'user_agent': request.headers.get('User-Agent')
    })

# Log suspicious activities
def log_suspicious_activity(query: str, reason: str):
    """Log potentially malicious queries"""
    log_security_event('suspicious_query', {
        'query': sanitize_for_logging(query),
        'reason': reason,
        'ip': request.remote_addr
    })
```

### Rate Limiting
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per minute"]
)

@app.route('/api/sql/execute', methods=['POST'])
@limiter.limit("10 per minute")
def execute_sql():
    # Rate limited endpoint
    pass
```

## 🧪 Security Testing

### Automated Security Tests
```python
# SQL injection test cases
INJECTION_TEST_CASES = [
    "'; DROP TABLE customer; --",
    "1' OR '1'='1",
    "UNION SELECT * FROM customer",
    "'; INSERT INTO customer VALUES (999, 'hacker', 'hacker'); --"
]

def test_sql_injection_prevention():
    """Test SQL injection prevention"""
    for test_case in INJECTION_TEST_CASES:
        response = client.post('/api/sql/execute', 
                             json={'query': test_case})
        assert response.status_code == 400
        assert 'unsafe' in response.json['error'].lower()
```

### Penetration Testing
- **OWASP ZAP**: Automated security scanning
- **Manual Testing**: Manual penetration testing
- **Code Review**: Security-focused code review
- **Dependency Scanning**: Vulnerability scanning for dependencies

## 📋 Security Checklist

### Development
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention implemented
- [ ] XSS prevention measures in place
- [ ] Error handling without information disclosure
- [ ] Secure logging practices
- [ ] Rate limiting implemented

### Deployment
- [ ] HTTPS enabled in production
- [ ] Database connections encrypted
- [ ] Security headers configured
- [ ] Access controls implemented
- [ ] Monitoring and alerting set up
- [ ] Regular security updates

### Maintenance
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Security patch management
- [ ] Incident response plan
- [ ] Security training for developers
- [ ] Regular penetration testing

## 🚀 Future Security Enhancements

### Phase 1: Authentication
- JWT-based authentication
- User management system
- Session management
- Password policies

### Phase 2: Authorization
- Role-based access control
- Permission management
- API key authentication
- OAuth integration

### Phase 3: Advanced Security
- Multi-factor authentication
- Audit logging and monitoring
- Security analytics
- Compliance reporting

---

*This security design provides comprehensive protection for Phil's Project while maintaining usability and functionality.*
