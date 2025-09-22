# Phil's Project

A full-stack SQL database interface with Flask backend and React frontend, featuring comprehensive sample data and modern UI.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)

### One-Command Setup

1. **Start the entire application:**
   ```bash
   # Backend (with database)
   cd backend && docker-compose up --build -d
   
   # Frontend (in new terminal)
   cd frontend && npm install && npm run dev
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001
   - Database: localhost:3306

## 📋 What's Included

### Backend Features
- **Flask API** with SQL execution endpoints
- **MySQL Database** with automatic initialization
- **Sample Data** - 300+ records across 6 tables
- **Security** - SQL injection protection
- **Docker** - Ephemeral data, fresh on every build

### Frontend Features
- **SQL Editor** with syntax highlighting
- **Query Results** in beautiful tables
- **Sample Queries** for business analysis
- **Table Browser** for schema exploration
- **Modern UI** with responsive design

### Sample Data
- **50 Suppliers** - Art supply companies
- **50 Customers** - Art studios and schools
- **50 Products** - Art materials and supplies
- **50 Orders** - Customer orders with various statuses
- **50 Warehouse Records** - Inventory tracking
- **50 Account Records** - Payment and billing

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Flask Backend  │    │  MySQL Database │
│   (Port 5173)   │◄──►│   (Port 5001)   │◄──►│   (Port 3306)   │
│                 │    │                 │    │                 │
│ • SQL Editor    │    │ • SQL API       │    │ • Schema        │
│ • Results Table │    │ • Security      │    │ • Sample Data   │
│ • Table Browser │    │ • Error Handling│    │ • Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Key Features

### SQL Interface
- Execute any SQL query with real-time results
- Syntax highlighting with VS Code Dark+ theme
- Automatic query formatting
- Error handling and validation

### Business Analysis
Pre-built queries for common business scenarios:
- Customer analysis and demographics
- Product performance and inventory
- Sales summaries and trends
- Overdue accounts and payments
- Fast/slow selling products

### Database Management
- Table schema inspection
- Column type information
- Relationship visualization
- Data exploration tools

## 📁 Project Structure

```
Phil's Project/
├── backend/                 # Flask API and Database
│   ├── app.py              # Main Flask application
│   ├── init.sql            # Database schema
│   ├── seed_data.sql       # Sample data
│   ├── docker-compose.yml  # Docker configuration
│   └── README.md           # Backend documentation
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api/           # Backend integration
│   │   └── utils/         # Utility functions
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

## 🚀 Getting Started

### Option 1: Full Stack (Recommended)

1. **Start Backend:**
   ```bash
   cd backend
   docker-compose up --build -d
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Open Application:**
   - Navigate to http://localhost:5173
   - Start exploring the data!

### Option 2: Backend Only

```bash
cd backend
docker-compose up --build -d

# Test the API
curl -X POST http://localhost:5001/api/sql/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM customer"}'
```

## 📊 Sample Queries

Try these queries in the interface:

### Basic Exploration
```sql
-- View all customers
SELECT * FROM customer LIMIT 10;

-- Find expensive products
SELECT * FROM product WHERE unitprice > 50;

-- Sales summary
SELECT COUNT(*) as total_orders, SUM(totalamount) as total_sales FROM orders;
```

### Business Analysis
```sql
-- Fast selling products (low inventory)
SELECT p.productname, p.unitprice, p.quantityonhand, p.reorderlevel
FROM product p
WHERE p.quantityonhand <= p.reorderlevel
ORDER BY p.unitprice DESC;

-- Overdue accounts
SELECT c.firstname, c.lastname, a.amountdue, a.duedate
FROM customer c
JOIN acct a ON c.customerid = a.customerid
WHERE a.paymentstatus = 'UNPAID' AND a.duedate < CURRENT_DATE;
```

## 🔧 Configuration

### Backend Configuration
- Database: MySQL 8.0
- Port: 5001
- Auto-initialization with sample data
- Ephemeral storage (fresh data on rebuild)

### Frontend Configuration
- React 18 + TypeScript
- Vite build tool
- Port: 5173 (auto-detects available port)
- Proxy to backend API

## 🛠️ Development

### Backend Development
```bash
cd backend
docker-compose up --build -d    # Start with fresh data
docker-compose logs -f backend  # View logs
docker-compose down -v          # Clean restart
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run format       # Format code
npm run lint:fix     # Fix linting issues
```

## 🔒 Security Features

- **SQL Injection Protection** - Basic security checks
- **Query Validation** - Blocks dangerous operations
- **Error Handling** - Safe error responses
- **Transaction Safety** - Automatic rollback on failures

## 📈 Performance

- **Fast Queries** - Optimized database schema
- **Real-time Results** - Instant query execution
- **Responsive UI** - Smooth user experience
- **Efficient Rendering** - React optimization

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Backend: Change port in `docker-compose.yml`
   - Frontend: Vite auto-detects available ports

2. **Database Connection**
   - Ensure Docker is running
   - Check `docker-compose ps` for container status

3. **Frontend Not Loading**
   - Verify backend is running on port 5001
   - Check browser console for errors

### Debug Commands
```bash
# Check container status
docker-compose ps

# View backend logs
docker-compose logs -f backend

# Restart with fresh data
docker-compose down -v && docker-compose up --build -d
```

## 📚 Documentation

- [Backend README](backend/README.md) - API documentation and setup
- [Frontend README](frontend/README.md) - UI components and development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and development purposes.

## 🎉 Enjoy!

You now have a fully functional SQL database interface with beautiful sample data. Start exploring and building amazing queries!
