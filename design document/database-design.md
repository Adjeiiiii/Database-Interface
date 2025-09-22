# Database Design

## 🗄️ Database Overview

Phil's Project uses MySQL 8.0 as the primary database, designed to simulate an art supply business with comprehensive sample data. The database follows normalized design principles while maintaining practical usability.

## 📊 Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    SUPPLIER     │    │     PRODUCT     │    │   ORDERITEM     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ SupplierID (PK) │◄───┤ SupplierID (FK) │    │ OrderID (FK)    │
│ SupplierName    │    │ ProductID (PK)  │◄───┤ ProductID (FK)  │
│ ContactName     │    │ ProductName     │    │ Quantity        │
│ Email           │    │ Description     │    │ UnitPrice       │
│ Phone           │    │ UnitPrice       │    │ TotalPrice      │
│ Address         │    │ QuantityOnHand  │    └─────────────────┘
│ City            │    │ ReorderLevel    │             │
│ State           │    └─────────────────┘             │
│ ZipCode         │             │                     │
└─────────────────┘             │                     │
                                │                     │
                                ▼                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    WAREHOUSE    │    │     ORDERS      │    │      ACCT       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ ProductID (FK)  │    │ OrderID (PK)    │    │ AccountID (PK)  │
│ LastRestocked   │    │ CustomerID (FK) │◄───┤ CustomerID (FK) │
│ Quantity        │    │ OrderDate       │    │ OrderID (FK)    │
└─────────────────┘    │ TotalAmount     │    │ AmountDue       │
                       │ Status          │    │ AmountPaid      │
                       └─────────────────┘    │ DueDate         │
                                │             │ PaymentStatus   │
                                │             └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    CUSTOMER     │
                       ├─────────────────┤
                       │ CustomerID (PK) │
                       │ FirstName       │
                       │ LastName        │
                       │ BusinessName    │
                       │ Email           │
                       │ Phone           │
                       │ Address         │
                       │ City            │
                       │ State           │
                       │ ZipCode         │
                       │ JoinDate        │
                       └─────────────────┘
```

## 🏗️ Table Specifications

### 1. **SUPPLIER** Table
**Purpose**: Stores information about art supply suppliers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| SupplierID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique supplier identifier |
| SupplierName | VARCHAR(100) | NOT NULL | Company name |
| ContactName | VARCHAR(100) | NOT NULL | Primary contact person |
| Email | VARCHAR(100) | NOT NULL, UNIQUE | Contact email |
| Phone | VARCHAR(20) | NOT NULL | Contact phone |
| Address | VARCHAR(200) | NOT NULL | Street address |
| City | VARCHAR(50) | NOT NULL | City name |
| State | VARCHAR(2) | NOT NULL | State abbreviation |
| ZipCode | VARCHAR(10) | NOT NULL | ZIP/postal code |

**Indexes**:
- Primary Key: `SupplierID`
- Unique Index: `Email`
- Index: `SupplierName` (for search optimization)

### 2. **CUSTOMER** Table
**Purpose**: Stores customer information for art studios, schools, and individuals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| CustomerID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique customer identifier |
| FirstName | VARCHAR(50) | NOT NULL | Customer first name |
| LastName | VARCHAR(50) | NOT NULL | Customer last name |
| BusinessName | VARCHAR(100) | NULL | Business/studio name |
| Email | VARCHAR(100) | NOT NULL, UNIQUE | Customer email |
| Phone | VARCHAR(20) | NOT NULL | Contact phone |
| Address | VARCHAR(200) | NOT NULL | Street address |
| City | VARCHAR(50) | NOT NULL | City name |
| State | VARCHAR(2) | NOT NULL | State abbreviation |
| ZipCode | VARCHAR(10) | NOT NULL | ZIP/postal code |
| JoinDate | DATE | NOT NULL, DEFAULT CURRENT_DATE | Customer registration date |

**Indexes**:
- Primary Key: `CustomerID`
- Unique Index: `Email`
- Index: `LastName, FirstName` (for customer lookup)
- Index: `BusinessName` (for business customers)

### 3. **PRODUCT** Table
**Purpose**: Stores art supply products and inventory information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ProductID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique product identifier |
| SupplierID | INT | NOT NULL, FOREIGN KEY | Reference to supplier |
| ProductName | VARCHAR(100) | NOT NULL | Product name |
| Description | TEXT | NULL | Product description |
| UnitPrice | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Price per unit |
| QuantityOnHand | INT | NOT NULL, DEFAULT 0, CHECK >= 0 | Current inventory |
| ReorderLevel | INT | NOT NULL, DEFAULT 0, CHECK >= 0 | Reorder threshold |

**Indexes**:
- Primary Key: `ProductID`
- Foreign Key: `SupplierID`
- Index: `ProductName` (for search optimization)
- Index: `UnitPrice` (for price range queries)

**Constraints**:
- `product_chk_1`: UnitPrice > 0
- `product_chk_2`: QuantityOnHand >= 0
- `product_chk_3`: ReorderLevel >= 0

### 4. **ORDERS** Table
**Purpose**: Stores customer orders and order status

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| OrderID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique order identifier |
| CustomerID | INT | NOT NULL, FOREIGN KEY | Reference to customer |
| OrderDate | DATE | NOT NULL, DEFAULT CURRENT_DATE | Order placement date |
| TotalAmount | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Total order amount |
| Status | ENUM | NOT NULL | Order status |

**Status Values**:
- `PENDING` - Order placed, awaiting processing
- `PAID` - Payment received
- `SHIPPED` - Order shipped
- `CANCELLED` - Order cancelled
- `REFUNDED` - Order refunded

**Indexes**:
- Primary Key: `OrderID`
- Foreign Key: `CustomerID`
- Index: `OrderDate` (for date range queries)
- Index: `Status` (for status filtering)

**Constraints**:
- `orders_chk_1`: TotalAmount > 0
- `orders_chk_2`: Status IN ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED', 'REFUNDED')

### 5. **ORDERITEM** Table
**Purpose**: Stores individual items within orders (many-to-many relationship)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| OrderID | INT | NOT NULL, FOREIGN KEY | Reference to order |
| ProductID | INT | NOT NULL, FOREIGN KEY | Reference to product |
| Quantity | INT | NOT NULL, CHECK > 0 | Quantity ordered |
| UnitPrice | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Price at time of order |
| TotalPrice | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Total line item price |

**Composite Primary Key**: `(OrderID, ProductID)`

**Indexes**:
- Primary Key: `(OrderID, ProductID)`
- Foreign Key: `OrderID`
- Foreign Key: `ProductID`

**Constraints**:
- `orderitem_chk_1`: Quantity > 0
- `orderitem_chk_2`: UnitPrice > 0
- `orderitem_chk_3`: TotalPrice > 0

### 6. **WAREHOUSE** Table
**Purpose**: Tracks warehouse inventory and restocking information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ProductID | INT | PRIMARY KEY, FOREIGN KEY | Reference to product |
| LastRestocked | DATE | NULL | Last restock date |
| Quantity | INT | NOT NULL, DEFAULT 0, CHECK >= 0 | Warehouse quantity |

**Indexes**:
- Primary Key: `ProductID`
- Index: `LastRestocked` (for restock analysis)

**Constraints**:
- `warehouse_chk_1`: Quantity >= 0

### 7. **ACCT** Table
**Purpose**: Tracks customer accounts, payments, and billing

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| AccountID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique account identifier |
| CustomerID | INT | NOT NULL, FOREIGN KEY | Reference to customer |
| OrderID | INT | NOT NULL, FOREIGN KEY | Reference to order |
| AmountDue | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Amount owed |
| AmountPaid | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | Amount paid |
| DueDate | DATE | NOT NULL | Payment due date |
| PaymentStatus | ENUM | NOT NULL | Payment status |

**Payment Status Values**:
- `PAID` - Fully paid
- `UNPAID` - Not yet paid
- `OVERDUE` - Past due date
- `PARTIAL` - Partially paid

**Indexes**:
- Primary Key: `AccountID`
- Foreign Key: `CustomerID`
- Foreign Key: `OrderID`
- Index: `DueDate` (for overdue tracking)
- Index: `PaymentStatus` (for status filtering)

**Constraints**:
- `acct_chk_1`: AmountDue >= 0
- `acct_chk_2`: AmountPaid >= 0
- `acct_chk_3`: PaymentStatus IN ('PAID', 'UNPAID', 'OVERDUE', 'PARTIAL')

## 🔗 Relationship Specifications

### One-to-Many Relationships

1. **Supplier → Product** (1:M)
   - One supplier can have many products
   - Foreign Key: `Product.SupplierID → Supplier.SupplierID`
   - Cascade: ON DELETE RESTRICT (prevent supplier deletion if products exist)

2. **Customer → Orders** (1:M)
   - One customer can have many orders
   - Foreign Key: `Orders.CustomerID → Customer.CustomerID`
   - Cascade: ON DELETE RESTRICT (prevent customer deletion if orders exist)

3. **Customer → Account** (1:M)
   - One customer can have many accounts
   - Foreign Key: `Acct.CustomerID → Customer.CustomerID`
   - Cascade: ON DELETE CASCADE (delete accounts when customer is deleted)

4. **Orders → Account** (1:1)
   - One order has one account record
   - Foreign Key: `Acct.OrderID → Orders.OrderID`
   - Cascade: ON DELETE CASCADE (delete account when order is deleted)

5. **Product → Warehouse** (1:1)
   - One product has one warehouse record
   - Foreign Key: `Warehouse.ProductID → Product.ProductID`
   - Cascade: ON DELETE CASCADE (delete warehouse record when product is deleted)

### Many-to-Many Relationships

1. **Orders ↔ Product** (M:M via OrderItem)
   - Many orders can contain many products
   - Junction Table: `OrderItem`
   - Foreign Keys: `OrderItem.OrderID → Orders.OrderID`
   - Foreign Keys: `OrderItem.ProductID → Product.ProductID`

## 📊 Sample Data Design

### Data Volume
- **50 Suppliers** - Art supply companies
- **50 Customers** - Art studios, schools, individual artists
- **50 Products** - Art supplies and materials
- **50 Orders** - Customer orders with various statuses
- **50 Warehouse Records** - Inventory tracking
- **50 Account Records** - Payment and billing information

### Data Relationships
- Each customer has 1-3 orders
- Each order contains 1-5 products
- Each product has 1 warehouse record
- Each order has 1 account record
- Suppliers are distributed across different states

### Data Quality
- **Realistic Data**: Names, addresses, and business information
- **Consistent Relationships**: Proper foreign key relationships
- **Valid Constraints**: All data meets check constraints
- **Business Logic**: Realistic order amounts, dates, and statuses

## 🔍 Query Optimization

### Indexing Strategy

1. **Primary Keys**: All tables have auto-increment primary keys
2. **Foreign Keys**: All foreign key columns are indexed
3. **Search Columns**: Frequently searched columns have indexes
4. **Composite Indexes**: Multi-column indexes for complex queries

### Common Query Patterns

1. **Customer Lookup**:
   ```sql
   SELECT * FROM customer WHERE LastName = ? AND FirstName = ?
   ```
   - Index: `(LastName, FirstName)`

2. **Product Search**:
   ```sql
   SELECT * FROM product WHERE ProductName LIKE ? OR Description LIKE ?
   ```
   - Index: `ProductName`

3. **Order History**:
   ```sql
   SELECT * FROM orders WHERE CustomerID = ? ORDER BY OrderDate DESC
   ```
   - Index: `CustomerID`, `OrderDate`

4. **Inventory Management**:
   ```sql
   SELECT * FROM product WHERE QuantityOnHand <= ReorderLevel
   ```
   - Index: `QuantityOnHand`, `ReorderLevel`

## 🛡️ Data Integrity

### Constraint Strategy
- **NOT NULL**: Required fields cannot be empty
- **UNIQUE**: Email addresses and other unique identifiers
- **CHECK**: Business rules enforced at database level
- **FOREIGN KEY**: Referential integrity maintained
- **DEFAULT**: Sensible default values for optional fields

### Validation Rules
- **Email Format**: Valid email address format
- **Phone Format**: Standard phone number format
- **Date Validation**: Logical date ranges
- **Amount Validation**: Positive monetary values
- **Status Validation**: Enum values only

## 🔄 Data Lifecycle

### Initialization
1. **Schema Creation**: Tables, indexes, and constraints
2. **Data Seeding**: Sample data insertion
3. **Validation**: Data integrity verification
4. **Index Optimization**: Query performance tuning

### Runtime Operations
1. **Query Execution**: Real-time SQL processing
2. **Data Modification**: INSERT, UPDATE, DELETE operations
3. **Transaction Management**: ACID compliance
4. **Error Handling**: Constraint violation handling

### Maintenance
1. **Data Refresh**: Ephemeral storage, fresh data on restart
2. **Index Maintenance**: Automatic index optimization
3. **Constraint Validation**: Ongoing data integrity checks
4. **Performance Monitoring**: Query execution analysis

---

*This database design provides a solid foundation for Phil's Project with realistic business data and proper relational structure.*
