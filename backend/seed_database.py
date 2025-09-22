#!/usr/bin/env python3
"""
Seed Database Script
Inserts sample data into the mini_project database
"""

import os
import pymysql
from pathlib import Path

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
DB_NAME = os.getenv('DB_NAME', 'phil_project')

def run_seed_data():
    """Run the seed data SQL script"""
    try:
        # Connect to MySQL
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4'
        )
        
        # Read the seed data SQL file
        script_path = Path(__file__).parent / 'seed_data.sql'
        with open(script_path, 'r') as file:
            sql_script = file.read()
        
        # Split the script into individual statements
        statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip() and not stmt.strip().startswith('--')]
        
        with connection.cursor() as cursor:
            for statement in statements:
                if statement:
                    print(f"Executing: {statement[:50]}...")
                    cursor.execute(statement)
            
            connection.commit()
            print("✅ Seed data inserted successfully!")
            
    except Exception as e:
        print(f"❌ Error inserting seed data: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()
    
    return True

if __name__ == '__main__':
    print("🌱 Inserting seed data into the database...")
    success = run_seed_data()
    if success:
        print("🎉 Database seeded successfully!")
    else:
        print("💥 Failed to seed database!")
