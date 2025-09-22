# Phil's Project Backend

A Flask backend with MySQL database setup using Docker, featuring a comprehensive SQL API for database operations.

## Features

- Flask web framework with SQL API
- MySQL database with automatic initialization and seeding
- Docker containerization with ephemeral data
- Health check endpoint
- Database auto-creation on startup
- SQLAlchemy ORM integration
- Comprehensive sample data (300+ records)
- SQL execution API with security checks
- Table schema inspection endpoints

## Quick Start

### Using Docker (Recommended)

1. **Start the services with fresh data:**
   ```bash
   docker-compose up --build -d
   ```

2. **Check if everything is running:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

4. **Test the health endpoint:**
   ```bash
   curl http://localhost:5001/health
   ```

### Running Locally (Development)

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start MySQL database:**
   ```bash
   docker-compose up mysql -d
   ```

3. **Run the Flask application:**
   ```bash
   python app.py
   ```

## API Endpoints

### Core Endpoints
- `GET /` - Home endpoint with API information
- `GET /health` - Health check endpoint

### SQL API Endpoints
- `POST /api/sql/execute` - Execute SQL queries
- `GET /api/sql/tables` - List all database tables
- `GET /api/sql/schema/<table_name>` - Get table schema information

### SQL API Usage

**Execute SQL Query:**
```bash
curl -X POST http://localhost:5001/api/sql/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM customer LIMIT 5"}'
```

**List Tables:**
```bash
curl http://localhost:5001/api/sql/tables
```

**Get Table Schema:**
```bash
curl http://localhost:5001/api/sql/schema/customer
```

## Database

- **Host:** localhost (or `mysql` when using Docker)
- **Port:** 3306
- **Database:** phil_project
- **Username:** root
- **Password:** password

The database will be automatically created and populated with sample data when you run the application. The data is ephemeral and gets recreated on every `docker-compose up --build -d`.

### Sample Data
The database comes pre-loaded with comprehensive sample data:
- **50 Suppliers** - Art supply companies
- **50 Customers** - Art studios, schools, and individual artists  
- **50 Products** - Art supplies and materials
- **50 Orders** - Customer orders with various statuses
- **50 Warehouse Records** - Inventory tracking
- **50 Account Records** - Payment and billing information

## Environment Variables

You can customize the configuration by modifying the `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=phil_project
FLASK_ENV=development
FLASK_DEBUG=True
```

## Project Structure

```
backend/
├── app.py              # Main Flask application with SQL API
├── requirements.txt    # Python dependencies
├── Dockerfile         # Docker configuration for Flask app
├── docker-compose.yml # Docker services configuration
├── init.sql           # Database schema initialization
├── seed_data.sql      # Sample data for database
├── seed_database.py   # Python script to load sample data
├── .env               # Environment variables
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Database Seeding

The database is automatically seeded with sample data during Docker initialization. No manual seeding is required.

### Automatic Seeding
When you run `docker-compose up --build -d`, the following happens:
1. Database schema is created from `init.sql`
2. Sample data is loaded from `seed_data.sql`
3. Fresh data is available immediately

### Manual Seeding (if needed)
If you need to reload the data manually:

```bash
# Stop and remove containers with volumes
docker-compose down -v

# Rebuild and start with fresh data
docker-compose up --build -d
```

## Security Features

- **SQL Injection Protection** - Basic security checks prevent dangerous operations
- **Query Validation** - Unsafe queries (DROP, TRUNCATE, etc.) are blocked
- **Error Handling** - Comprehensive error responses for debugging
- **Transaction Safety** - Automatic rollback on query failures

## Sample Queries

Try these sample queries with the SQL API:

```sql
-- View all customers
SELECT * FROM customer LIMIT 10;

-- Find expensive products
SELECT * FROM product WHERE unitprice > 50;

-- Sales summary
SELECT COUNT(*) as total_orders, SUM(totalamount) as total_sales FROM orders;

-- Customer orders with details
SELECT c.firstname, c.lastname, o.totalamount, o.status 
FROM customer c 
JOIN orders o ON c.customerid = o.customerid 
LIMIT 10;
```

## Next Steps

1. ✅ Database schema and sample data are ready
2. ✅ SQL API is fully functional
3. Use the frontend interface to explore the data
4. Add more complex business logic as needed
5. Configure authentication if required
