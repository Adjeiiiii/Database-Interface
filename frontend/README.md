# Phil's Project Frontend

A React + TypeScript frontend for SQL database operations with a beautiful, modern interface.

## Features

- **SQL Query Interface** - Execute SQL queries with syntax highlighting
- **Real-time Results** - Instant query execution and result display
- **Syntax Highlighting** - Beautiful SQL code formatting with VS Code Dark+ theme
- **Sample Queries** - Pre-built business analysis queries
- **Table Browser** - Explore database tables and schemas
- **Query Formatting** - Automatic SQL formatting for better readability
- **Responsive Design** - Works on desktop and mobile devices
- **Modern UI** - Clean, professional interface with smooth animations

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend running on port 5001

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── SqlInterface.tsx    # Main SQL interface component
│   │   ├── SqlEditor.tsx       # SQL editor with syntax highlighting
│   │   └── SqlResult.tsx       # Query results display
│   ├── api/
│   │   └── sqlApi.ts          # Backend API integration
│   ├── utils/
│   │   └── sqlFormatter.ts    # SQL formatting utilities
│   ├── App.tsx                # Main application component
│   ├── App.css               # Global styles
│   └── main.tsx              # Application entry point
├── package.json
├── vite.config.ts            # Vite configuration
├── .prettierrc               # Prettier configuration
├── .eslintrc.cjs            # ESLint configuration
└── README.md
```

## Features Overview

### SQL Query Editor
- **Syntax Highlighting** - SQL keywords, strings, and comments are color-coded
- **Auto-formatting** - Format SQL queries for better readability
- **Query History** - Keep track of executed queries
- **Error Handling** - Clear error messages for invalid queries

### Sample Queries
Pre-built business analysis queries including:
- Customer data exploration
- Product analysis
- Sales summaries
- Inventory tracking
- Overdue accounts
- Fast/slow selling products

### Table Browser
- **Table List** - View all available database tables
- **Schema Inspection** - See table structures and column types
- **Quick Access** - Click to insert table names into queries

### Results Display
- **Formatted Results** - Clean, readable table display
- **Execution Time** - Query performance metrics
- **Row Counts** - Number of returned records
- **Error Messages** - Detailed error information

## API Integration

The frontend communicates with the backend through these endpoints:

- `POST /api/sql/execute` - Execute SQL queries
- `GET /api/sql/tables` - Get list of tables
- `GET /api/sql/schema/<table>` - Get table schema

## Configuration

### Vite Proxy
The frontend is configured to proxy API requests to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:5001'
  }
}
```

### Environment Variables
Create a `.env.local` file for custom configuration:

```env
VITE_API_BASE_URL=http://localhost:5001
```

## Styling

The application uses:
- **Inline Styles** - For component-specific styling
- **CSS Modules** - For global styles
- **Prettier** - For code formatting
- **ESLint** - For code quality

## Sample Queries

Try these sample queries in the interface:

### Basic Queries
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
-- Fast selling products
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

## Development

### Code Quality
- **TypeScript** - Type-safe development
- **ESLint** - Code linting and best practices
- **Prettier** - Consistent code formatting
- **React Hooks** - Modern React patterns

### Performance
- **Vite** - Fast build tool and dev server
- **Code Splitting** - Optimized bundle sizes
- **Tree Shaking** - Remove unused code
- **Hot Module Replacement** - Instant updates during development

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend is running on port 5001
   - Check proxy configuration in `vite.config.ts`

2. **Syntax Highlighting Issues**
   - Clear browser cache
   - Restart development server

3. **Query Execution Errors**
   - Check SQL syntax
   - Verify table and column names
   - Check backend logs for detailed errors

### Debug Mode
Enable debug logging by opening browser developer tools and checking the console for detailed information.

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Test with various SQL queries
5. Update documentation as needed

## License

This project is part of Phil's Project and is intended for educational and development purposes.# Database-Interface
