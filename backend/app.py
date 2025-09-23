from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
import pymysql
import time
import re
from sqlalchemy import text

# Initialize Flask app
app = Flask(__name__)

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
DB_NAME = os.getenv('DB_NAME', 'phil_project')

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

def create_database_if_not_exists():
    """Create database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
            print(f"Database '{DB_NAME}' is ready")
            
        connection.close()
    except Exception as e:
        print(f"Error creating database: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'message': 'Backend is running properly'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e)
        }), 500

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Welcome to Phil\'s Project Backend',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'home': '/',
            'sql_execute': '/api/sql/execute',
            'sql_tables': '/api/sql/tables',
            'sql_schema': '/api/sql/schema'
        }
    })

@app.route('/api/sql/execute', methods=['POST'])
def execute_sql():
    """Execute SQL commands"""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': 'No query provided',
                'message': 'Please provide a SQL query in the request body'
            }), 400
        
        query = data['query'].strip()
        if not query:
            return jsonify({
                'success': False,
                'error': 'Empty query',
                'message': 'Query cannot be empty'
            }), 400
        
        # Basic security checks
        if not is_safe_query(query):
            return jsonify({
                'success': False,
                'error': 'Potentially unsafe query',
                'message': 'Query contains potentially dangerous operations'
            }), 400
        
        start_time = time.time()
        
        # Execute the query
        result = db.session.execute(text(query))
        execution_time = time.time() - start_time
        
        # Determine query type and format response
        query_upper = query.upper().strip()
        
        if query_upper.startswith('SELECT') or query_upper.startswith('SHOW') or query_upper.startswith('DESCRIBE') or query_upper.startswith('EXPLAIN'):
            # For SELECT, SHOW, DESCRIBE queries - return data
            rows = result.fetchall()
            columns = list(result.keys()) if hasattr(result, 'keys') else []
            
            # Convert rows to list of dictionaries
            data_rows = []
            for row in rows:
                if hasattr(row, '_asdict'):
                    data_rows.append(row._asdict())
                else:
                    data_rows.append(dict(zip(columns, row)))
            
            return jsonify({
                'success': True,
                'data': data_rows,
                'columns': columns,
                'row_count': len(data_rows),
                'execution_time': f"{execution_time:.3f}s",
                'query': query
            })
        
        else:
            # For INSERT, UPDATE, DELETE, CREATE, ALTER, DROP queries
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Query executed successfully',
                'affected_rows': result.rowcount if hasattr(result, 'rowcount') else 0,
                'execution_time': f"{execution_time:.3f}s",
                'query': query
            })
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Query execution failed',
            'query': query if 'query' in locals() else 'Unknown'
        }), 500

@app.route('/api/sql/tables', methods=['GET'])
def get_tables():
    """Get list of all tables"""
    try:
        result = db.session.execute(text("SHOW TABLES"))
        tables = [row[0] for row in result.fetchall()]
        
        return jsonify({
            'success': True,
            'tables': tables,
            'count': len(tables)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to fetch tables'
        }), 500

@app.route('/api/sql/schema/<table_name>', methods=['GET'])
def get_table_schema(table_name):
    """Get schema information for a specific table"""
    try:
        # Get table structure
        result = db.session.execute(text(f"DESCRIBE {table_name}"))
        columns = []
        for row in result.fetchall():
            columns.append({
                'field': row[0],
                'type': row[1],
                'null': row[2],
                'key': row[3],
                'default': row[4],
                'extra': row[5]
            })
        
        return jsonify({
            'success': True,
            'table': table_name,
            'columns': columns,
            'column_count': len(columns)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': f'Failed to fetch schema for table: {table_name}'
        }), 500

def is_safe_query(query):
    """Basic security check for SQL queries"""
    # Convert to uppercase for checking
    query_upper = query.upper().strip()
    
    # Block potentially dangerous operations
    dangerous_patterns = [
        r'\bDROP\s+DATABASE\b',
        r'\bDROP\s+USER\b',
        r'\bGRANT\b',
        r'\bREVOKE\b',
        r'\bFLUSH\b',
        r'\bRESET\b',
        r'\bSHUTDOWN\b',
        r'\bKILL\b',
        r'\bLOAD_FILE\b',
        r'\bINTO\s+OUTFILE\b',
        r'\bINTO\s+DUMPFILE\b',
        r'\bUNION\s+SELECT\b.*\bINTO\b',
        r'\bEXEC\b',
        r'\bEXECUTE\b',
        r'\bSP_\b',
        r'\bXP_\b'
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, query_upper):
            return False
    
    return True

@app.route('/api/purchase/create', methods=['POST'])
def create_purchase():
    """Create a new purchase/order"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'message': 'Please provide purchase data in the request body'
            }), 400
        
        # Validate required fields
        required_fields = ['customerid', 'productid', 'quantity', 'unitprice']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'message': f'Please provide {field} in the request body'
                }), 400
        
        customerid = data['customerid']
        productid = data['productid']
        quantity = data['quantity']
        unitprice = data['unitprice']
        notes = data.get('notes', '')
        
        # Validate data types and values
        try:
            customerid = int(customerid)
            productid = int(productid)
            quantity = int(quantity)
            unitprice = float(unitprice)
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Invalid data types',
                'message': 'Please provide valid numeric values for customerid, productid, quantity, and unitprice'
            }), 400
        
        if quantity <= 0:
            return jsonify({
                'success': False,
                'error': 'Invalid quantity',
                'message': 'Quantity must be greater than 0'
            }), 400
        
        if unitprice < 0:
            return jsonify({
                'success': False,
                'error': 'Invalid unit price',
                'message': 'Unit price must be greater than or equal to 0'
            }), 400
        
        # Check if customer exists
        customer_check = db.session.execute(text("SELECT customerid FROM customer WHERE customerid = :customerid"), 
                                          {'customerid': customerid})
        if not customer_check.fetchone():
            return jsonify({
                'success': False,
                'error': 'Customer not found',
                'message': f'Customer with ID {customerid} does not exist'
            }), 400
        
        # Check if product exists and has enough stock
        product_check = db.session.execute(text("""
            SELECT productname, quantityonhand, unitprice 
            FROM product 
            WHERE productid = :productid
        """), {'productid': productid})
        product_result = product_check.fetchone()
        
        if not product_result:
            return jsonify({
                'success': False,
                'error': 'Product not found',
                'message': f'Product with ID {productid} does not exist'
            }), 400
        
        if product_result[1] < quantity:  # quantityonhand < requested quantity
            return jsonify({
                'success': False,
                'error': 'Insufficient stock',
                'message': f'Only {product_result[1]} units available for {product_result[0]}'
            }), 400
        
        # Calculate total amount
        total_amount = quantity * unitprice
        
        # Create the order
        order_query = text("""
            INSERT INTO orders (customerid, totalamount, status, orderdate, notes) 
            VALUES (:customerid, :totalamount, 'PENDING', CURDATE(), :notes)
        """)
        
        result = db.session.execute(order_query, {
            'customerid': customerid,
            'totalamount': total_amount,
            'notes': notes
        })
        
        # Get the new order ID
        order_id = result.lastrowid
        
        # Update product stock (reduce quantity)
        update_stock_query = text("""
            UPDATE product 
            SET quantityonhand = quantityonhand - :quantity 
            WHERE productid = :productid
        """)
        
        db.session.execute(update_stock_query, {
            'quantity': quantity,
            'productid': productid
        })
        
        # Commit the transaction
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Purchase created successfully',
            'order_id': order_id,
            'total_amount': total_amount,
            'product_name': product_result[0],
            'quantity': quantity,
            'unit_price': unitprice
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to create purchase'
        }), 500

@app.route('/api/customer/create', methods=['POST'])
def create_customer():
    """Create a new customer"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'message': 'Please provide customer data in the request body'
            }), 400
        
        # Validate required fields
        required_fields = ['firstname', 'lastname', 'email']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'message': f'Please provide {field}'
                }), 400
        
        firstname = data['firstname'].strip()
        lastname = data['lastname'].strip()
        email = data['email'].strip()
        businessname = data.get('businessname', '').strip() or None
        phone = data.get('phone', '').strip() or None
        address = data.get('address', '').strip() or None
        city = data.get('city', '').strip() or None
        state = data.get('state', '').strip() or None
        zipcode = data.get('zipcode', '').strip() or None
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return jsonify({
                'success': False,
                'error': 'Invalid email format',
                'message': 'Please provide a valid email address'
            }), 400
        
        # Check if email already exists
        email_check = db.session.execute(text("SELECT customerid FROM customer WHERE email = :email"), 
                                       {'email': email})
        if email_check.fetchone():
            return jsonify({
                'success': False,
                'error': 'Email already exists',
                'message': f'Customer with email {email} already exists'
            }), 400
        
        # Create the customer
        customer_query = text("""
            INSERT INTO customer (firstname, lastname, businessname, email, phone, address, city, state, zipcode, joindate) 
            VALUES (:firstname, :lastname, :businessname, :email, :phone, :address, :city, :state, :zipcode, CURDATE())
        """)
        
        result = db.session.execute(customer_query, {
            'firstname': firstname,
            'lastname': lastname,
            'businessname': businessname,
            'email': email,
            'phone': phone,
            'address': address,
            'city': city,
            'state': state,
            'zipcode': zipcode
        })
        
        # Get the new customer ID
        customer_id = result.lastrowid
        
        # Commit the transaction
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Customer created successfully',
            'customer_id': customer_id,
            'customer': {
                'customerid': customer_id,
                'firstname': firstname,
                'lastname': lastname,
                'businessname': businessname,
                'email': email,
                'phone': phone,
                'address': address,
                'city': city,
                'state': state,
                'zipcode': zipcode
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to create customer'
        }), 500

if __name__ == '__main__':
    # Create database if it doesn't exist
    create_database_if_not_exists()
    
    # Create all tables
    with app.app_context():
        db.create_all()
    
    # Run the application
    app.run(host='0.0.0.0', port=5000, debug=True)
