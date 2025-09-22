# Testing Strategy

## 🧪 Testing Overview

Phil's Project implements a comprehensive testing strategy covering unit tests, integration tests, end-to-end tests, and security testing. The testing approach ensures code quality, functionality, and security while maintaining development velocity.

## 🏗️ Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │ ← Few, High Value
                    │   (Cypress)     │
                    └─────────────────┘
                  ┌─────────────────────┐
                  │ Integration Tests   │ ← Some, Medium Value
                  │   (Jest/API)       │
                  └─────────────────────┘
                ┌─────────────────────────┐
                │    Unit Tests          │ ← Many, Low Value
                │  (Jest/React Testing)  │
                └─────────────────────────┘
```

## 🔧 Testing Tools and Frameworks

### Frontend Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **MSW**: API mocking

### Backend Testing
- **pytest**: Python testing framework
- **Flask Test Client**: API testing
- **SQLAlchemy Test**: Database testing
- **Coverage.py**: Code coverage

### Security Testing
- **Bandit**: Python security linting
- **ESLint Security**: JavaScript security
- **OWASP ZAP**: Security scanning
- **SQLMap**: SQL injection testing

## 🧩 Unit Testing

### Frontend Unit Tests

#### Component Testing
```typescript
// SqlEditor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SqlEditor } from './SqlEditor';

describe('SqlEditor', () => {
  test('renders textarea with placeholder', () => {
    render(<SqlEditor value="" onChange={jest.fn()} />);
    expect(screen.getByPlaceholderText('Enter your SQL query...')).toBeInTheDocument();
  });

  test('calls onChange when text changes', () => {
    const mockOnChange = jest.fn();
    render(<SqlEditor value="" onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'SELECT * FROM customer' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('SELECT * FROM customer');
  });

  test('shows syntax highlighting when focused', () => {
    render(<SqlEditor value="SELECT * FROM customer" onChange={jest.fn()} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.focus(textarea);
    
    expect(screen.getByText('SELECT * FROM customer')).toBeInTheDocument();
  });
});
```

#### Utility Function Testing
```typescript
// sqlFormatter.test.ts
import { formatSql } from './sqlFormatter';

describe('formatSql', () => {
  test('formats basic SELECT query', () => {
    const input = 'SELECT * FROM customer WHERE id = 1';
    const expected = 'SELECT *\nFROM customer\nWHERE id = 1';
    
    expect(formatSql(input)).toBe(expected);
  });

  test('handles empty input', () => {
    expect(formatSql('')).toBe('');
  });

  test('formats complex query with JOINs', () => {
    const input = 'SELECT c.name, o.total FROM customer c JOIN orders o ON c.id = o.customer_id';
    const expected = 'SELECT c.name, o.total\nFROM customer c\nJOIN orders o ON c.id = o.customer_id';
    
    expect(formatSql(input)).toBe(expected);
  });
});
```

### Backend Unit Tests

#### API Endpoint Testing
```python
# test_app.py
import pytest
from app import app, db

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'

def test_execute_sql_select(client):
    """Test SQL execution for SELECT queries"""
    response = client.post('/api/sql/execute', 
                          json={'query': 'SELECT 1 as test'})
    assert response.status_code == 200
    assert response.json['success'] == True
    assert response.json['data'] == [{'test': 1}]

def test_execute_sql_invalid(client):
    """Test SQL execution with invalid query"""
    response = client.post('/api/sql/execute', 
                          json={'query': 'INVALID SQL'})
    assert response.status_code == 500
    assert response.json['success'] == False

def test_execute_sql_unsafe(client):
    """Test SQL execution with unsafe query"""
    response = client.post('/api/sql/execute', 
                          json={'query': 'DROP TABLE customer'})
    assert response.status_code == 400
    assert 'unsafe' in response.json['error'].lower()
```

#### Business Logic Testing
```python
# test_security.py
from app import is_safe_query

def test_safe_queries():
    """Test that safe queries are allowed"""
    safe_queries = [
        'SELECT * FROM customer',
        'SELECT COUNT(*) FROM orders',
        'SHOW TABLES',
        'DESCRIBE customer'
    ]
    
    for query in safe_queries:
        assert is_safe_query(query) == True

def test_unsafe_queries():
    """Test that unsafe queries are blocked"""
    unsafe_queries = [
        'DROP TABLE customer',
        'TRUNCATE orders',
        'DELETE FROM customer',
        'UPDATE customer SET name = "hacker"'
    ]
    
    for query in unsafe_queries:
        assert is_safe_query(query) == False
```

## 🔗 Integration Testing

### API Integration Tests
```python
# test_api_integration.py
import pytest
import requests

@pytest.fixture
def api_base_url():
    return 'http://localhost:5001'

def test_full_api_workflow(api_base_url):
    """Test complete API workflow"""
    # Test health check
    response = requests.get(f'{api_base_url}/health')
    assert response.status_code == 200
    
    # Test table listing
    response = requests.get(f'{api_base_url}/api/sql/tables')
    assert response.status_code == 200
    assert 'tables' in response.json()
    
    # Test query execution
    response = requests.post(f'{api_base_url}/api/sql/execute',
                           json={'query': 'SELECT COUNT(*) as count FROM customer'})
    assert response.status_code == 200
    assert response.json()['success'] == True
    assert response.json()['data'][0]['count'] == 50
```

### Database Integration Tests
```python
# test_database_integration.py
import pytest
from app import db, Customer, Product, Order

def test_database_relationships():
    """Test database relationships work correctly"""
    # Create test data
    customer = Customer(firstname='Test', lastname='User', email='test@example.com')
    db.session.add(customer)
    db.session.commit()
    
    product = Product(productname='Test Product', unitprice=10.00, supplierid=1)
    db.session.add(product)
    db.session.commit()
    
    order = Order(customerid=customer.customerid, totalamount=10.00)
    db.session.add(order)
    db.session.commit()
    
    # Test relationships
    assert customer.orders[0].orderid == order.orderid
    assert order.customer.customerid == customer.customerid
```

## 🎭 End-to-End Testing

### Cypress E2E Tests
```typescript
// cypress/e2e/sql-interface.cy.ts
describe('SQL Interface', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('loads the application', () => {
    cy.contains('Phil\'s Project - SQL Interface').should('be.visible');
    cy.get('[data-testid="sql-editor"]').should('be.visible');
  });

  it('executes a sample query', () => {
    cy.get('[data-testid="sample-query-customers"]').click();
    cy.get('[data-testid="execute-button"]').click();
    
    cy.get('[data-testid="query-result"]').should('be.visible');
    cy.get('[data-testid="result-table"]').should('contain', 'customerid');
  });

  it('formats SQL query', () => {
    cy.get('[data-testid="sql-editor"]').type('SELECT * FROM customer WHERE id = 1');
    cy.get('[data-testid="format-button"]').click();
    
    cy.get('[data-testid="sql-editor"]').should('contain', 'SELECT *\nFROM customer\nWHERE id = 1');
  });

  it('displays error for invalid query', () => {
    cy.get('[data-testid="sql-editor"]').type('INVALID SQL QUERY');
    cy.get('[data-testid="execute-button"]').click();
    
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Query execution failed');
  });

  it('switches between tabs', () => {
    cy.get('[data-testid="tables-tab"]').click();
    cy.get('[data-testid="tables-list"]').should('be.visible');
    
    cy.get('[data-testid="query-tab"]').click();
    cy.get('[data-testid="sql-editor"]').should('be.visible');
  });
});
```

### User Journey Tests
```typescript
// cypress/e2e/user-journey.cy.ts
describe('User Journey', () => {
  it('completes a full data exploration workflow', () => {
    // 1. Load application
    cy.visit('http://localhost:5173');
    
    // 2. Execute sample query
    cy.get('[data-testid="sample-query-customers"]').click();
    cy.get('[data-testid="execute-button"]').click();
    cy.get('[data-testid="result-table"]').should('be.visible');
    
    // 3. Format query
    cy.get('[data-testid="format-button"]').click();
    
    // 4. Switch to tables tab
    cy.get('[data-testid="tables-tab"]').click();
    cy.get('[data-testid="tables-list"]').should('be.visible');
    
    // 5. View table schema
    cy.get('[data-testid="table-customer"]').click();
    cy.get('[data-testid="table-schema"]').should('be.visible');
    
    // 6. Execute custom query
    cy.get('[data-testid="query-tab"]').click();
    cy.get('[data-testid="sql-editor"]').clear().type('SELECT COUNT(*) as total FROM customer');
    cy.get('[data-testid="execute-button"]').click();
    cy.get('[data-testid="result-table"]').should('contain', 'total');
  });
});
```

## 🔒 Security Testing

### SQL Injection Testing
```python
# test_security_injection.py
import pytest
import requests

@pytest.fixture
def api_base_url():
    return 'http://localhost:5001'

def test_sql_injection_prevention(api_base_url):
    """Test SQL injection prevention"""
    injection_queries = [
        "'; DROP TABLE customer; --",
        "1' OR '1'='1",
        "UNION SELECT * FROM customer",
        "'; INSERT INTO customer VALUES (999, 'hacker', 'hacker'); --"
    ]
    
    for query in injection_queries:
        response = requests.post(f'{api_base_url}/api/sql/execute',
                               json={'query': query})
        assert response.status_code == 400
        assert 'unsafe' in response.json['error'].lower()

def test_xss_prevention(api_base_url):
    """Test XSS prevention in responses"""
    response = requests.post(f'{api_base_url}/api/sql/execute',
                           json={'query': 'SELECT "<script>alert(1)</script>" as test'})
    assert response.status_code == 200
    assert '<script>' not in response.text
```

### Input Validation Testing
```python
# test_input_validation.py
def test_query_length_limits(client):
    """Test query length limits"""
    long_query = 'SELECT * FROM customer ' + 'WHERE id = 1 ' * 1000
    
    response = client.post('/api/sql/execute', 
                          json={'query': long_query})
    assert response.status_code == 400
    assert 'too long' in response.json['error'].lower()

def test_empty_query_validation(client):
    """Test empty query validation"""
    response = client.post('/api/sql/execute', 
                          json={'query': ''})
    assert response.status_code == 400
    assert 'empty' in response.json['error'].lower()

def test_missing_query_parameter(client):
    """Test missing query parameter"""
    response = client.post('/api/sql/execute', 
                          json={})
    assert response.status_code == 400
    assert 'query' in response.json['error'].lower()
```

## 📊 Performance Testing

### Load Testing
```python
# test_performance.py
import time
import concurrent.futures
import requests

def test_query_performance():
    """Test query execution performance"""
    start_time = time.time()
    
    response = requests.post('http://localhost:5001/api/sql/execute',
                           json={'query': 'SELECT * FROM customer LIMIT 10'})
    
    execution_time = time.time() - start_time
    
    assert response.status_code == 200
    assert execution_time < 2.0  # Should complete within 2 seconds

def test_concurrent_requests():
    """Test concurrent request handling"""
    def make_request():
        response = requests.post('http://localhost:5001/api/sql/execute',
                               json={'query': 'SELECT COUNT(*) FROM customer'})
        return response.status_code == 200
    
    # Test 10 concurrent requests
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(10)]
        results = [future.result() for future in futures]
    
    assert all(results)  # All requests should succeed
```

### Memory Testing
```python
# test_memory.py
import psutil
import requests

def test_memory_usage():
    """Test memory usage during query execution"""
    process = psutil.Process()
    initial_memory = process.memory_info().rss
    
    # Execute multiple queries
    for _ in range(100):
        response = requests.post('http://localhost:5001/api/sql/execute',
                               json={'query': 'SELECT * FROM customer LIMIT 5'})
        assert response.status_code == 200
    
    final_memory = process.memory_info().rss
    memory_increase = final_memory - initial_memory
    
    # Memory increase should be reasonable (< 50MB)
    assert memory_increase < 50 * 1024 * 1024
```

## 🧪 Test Data Management

### Test Database Setup
```python
# conftest.py
import pytest
from app import app, db

@pytest.fixture(scope='session')
def test_db():
    """Create test database"""
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    
    with app.app_context():
        db.create_all()
        yield db
        db.drop_all()

@pytest.fixture
def sample_data(test_db):
    """Insert sample test data"""
    from app import Customer, Product, Order
    
    # Create test customer
    customer = Customer(
        firstname='Test',
        lastname='User',
        email='test@example.com',
        phone='555-0123'
    )
    test_db.session.add(customer)
    test_db.session.commit()
    
    return customer
```

### Mock Data Generation
```python
# test_data_generator.py
import factory
from app import Customer, Product, Order

class CustomerFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Customer
        sqlalchemy_session = db.session
    
    firstname = factory.Faker('first_name')
    lastname = factory.Faker('last_name')
    email = factory.Faker('email')
    phone = factory.Faker('phone_number')

def test_with_factory_data():
    """Test with factory-generated data"""
    customer = CustomerFactory()
    assert customer.firstname is not None
    assert customer.email is not None
```

## 📈 Test Coverage

### Coverage Configuration
```python
# pytest.ini
[tool:pytest]
addopts = --cov=app --cov-report=html --cov-report=term-missing
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

### Coverage Goals
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical user paths
- **Security Tests**: All security functions

### Coverage Reporting
```bash
# Generate coverage report
pytest --cov=app --cov-report=html

# View coverage report
open htmlcov/index.html
```

## 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          pip install pytest pytest-cov
      
      - name: Run backend tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm test -- --coverage
      
      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
```

## 📋 Testing Checklist

### Pre-commit Testing
- [ ] Unit tests passing
- [ ] Linting checks passing
- [ ] Type checking passing
- [ ] Security scans clean

### Pre-deployment Testing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance tests passing
- [ ] Security tests passing
- [ ] Coverage requirements met

### Post-deployment Testing
- [ ] Smoke tests passing
- [ ] Health checks responding
- [ ] User acceptance testing
- [ ] Monitoring alerts configured

---

*This testing strategy ensures comprehensive quality assurance for Phil's Project while maintaining development efficiency.*
