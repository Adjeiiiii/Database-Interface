-- Database initialization script
-- This file will be executed when the MySQL container starts for the first time

-- Use the database
USE phil_project;

-- =============================================================================
-- mini_project.sql  |  MySQL schema + tables + indexes
-- Target: Registration/Inventory/Accounts baseline for Flask backend
-- Converted from PostgreSQL to MySQL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Clean drops (order matters due to FKs)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS acct      CASCADE;
DROP TABLE IF EXISTS orders    CASCADE;
DROP TABLE IF EXISTS whouse    CASCADE;
DROP TABLE IF EXISTS product   CASCADE;
DROP TABLE IF EXISTS supplier  CASCADE;
DROP TABLE IF EXISTS customer  CASCADE;

-- -----------------------------------------------------------------------------
-- 2) Tables
-- -----------------------------------------------------------------------------

-- Customer
CREATE TABLE customer (
    customerid      INT AUTO_INCREMENT PRIMARY KEY,
    firstname       VARCHAR(50)  NOT NULL,
    lastname        VARCHAR(50)  NOT NULL,
    businessname    VARCHAR(100),
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    address         VARCHAR(150),
    city            VARCHAR(50),
    state           VARCHAR(50),
    zipcode         VARCHAR(10),
    joindate        DATE         NOT NULL DEFAULT (CURRENT_DATE)
);

-- Supplier
CREATE TABLE supplier (
    supplierid      INT AUTO_INCREMENT PRIMARY KEY,
    suppliername    VARCHAR(100) NOT NULL,
    contactname     VARCHAR(50),
    email           VARCHAR(100),
    phone           VARCHAR(20),
    address         VARCHAR(150),
    city            VARCHAR(50),
    state           VARCHAR(50),
    zipcode         VARCHAR(10)
    -- Add UNIQUE(email) if supplier emails must be unique
);

-- Product
CREATE TABLE product (
    productid       INT AUTO_INCREMENT PRIMARY KEY,
    productname     VARCHAR(100) NOT NULL,
    description     TEXT,
    supplierid      INT NOT NULL,
    unitprice       DECIMAL(10,2) NOT NULL CHECK (unitprice >= 0),
    quantityonhand  INT NOT NULL DEFAULT 0 CHECK (quantityonhand >= 0),
    reorderlevel    INT NOT NULL DEFAULT 0 CHECK (reorderlevel >= 0),
    CONSTRAINT fk_product_supplier
        FOREIGN KEY (supplierid)
        REFERENCES supplier(supplierid)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Warehouse (Whouse)
-- One row per (product, location). Enforce uniqueness on that pair.
CREATE TABLE whouse (
    warehouseid     INT AUTO_INCREMENT PRIMARY KEY,
    productid       INT NOT NULL,
    locationcode    VARCHAR(20) NOT NULL,
    quantitystored  INT NOT NULL DEFAULT 0 CHECK (quantitystored >= 0),
    lastrestocked   DATE,
    CONSTRAINT fk_whouse_product
        FOREIGN KEY (productid)
        REFERENCES product(productid)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_whouse_product_location
        UNIQUE (productid, locationcode)
);

-- Orders
CREATE TABLE orders (
    orderid         INT AUTO_INCREMENT PRIMARY KEY,
    customerid      INT NOT NULL,
    orderdate       DATE NOT NULL DEFAULT (CURRENT_DATE),
    shipdate        DATE,
    totalamount     DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (totalamount >= 0),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','PAID','SHIPPED','CANCELLED','REFUNDED')),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customerid)
        REFERENCES customer(customerid)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_ship_after_order
        CHECK (shipdate IS NULL OR shipdate >= orderdate)
);

-- Accounts (Acct) - one receivable row per order
CREATE TABLE acct (
    accountid       INT AUTO_INCREMENT PRIMARY KEY,
    customerid      INT NOT NULL,
    orderid         INT NOT NULL UNIQUE,
    amountdue       DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (amountdue >= 0),
    amountpaid      DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (amountpaid >= 0),
    duedate         DATE,
    paymentstatus   VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
                    CHECK (paymentstatus IN ('UNPAID','PARTIAL','PAID','OVERDUE','WRITEOFF')),
    CONSTRAINT fk_acct_customer
        FOREIGN KEY (customerid)
        REFERENCES customer(customerid)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_acct_order
        FOREIGN KEY (orderid)
        REFERENCES orders(orderid)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT chk_amounts_consistent
        CHECK (amountpaid <= amountdue)
);

-- -----------------------------------------------------------------------------
-- 3) Indexes (MySQL auto-indexes PKs but not FKs or most lookups)
-- -----------------------------------------------------------------------------
CREATE INDEX idx_product_supplier
    ON product (supplierid);

CREATE INDEX idx_whouse_product
    ON whouse (productid);

CREATE INDEX idx_orders_customer
    ON orders (customerid);

CREATE INDEX idx_orders_status
    ON orders (status);

CREATE INDEX idx_acct_customer
    ON acct (customerid);

CREATE INDEX idx_customer_email
    ON customer (email);

CREATE INDEX idx_customer_phone
    ON customer (phone);
