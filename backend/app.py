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

if __name__ == '__main__':
    # Create database if it doesn't exist
    create_database_if_not_exists()
    
    # Create all tables
    with app.app_context():
        db.create_all()
    
    # Run the application
    app.run(host='0.0.0.0', port=5000, debug=True)
