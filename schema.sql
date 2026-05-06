-- Create the database
CREATE DATABASE IF NOT EXISTS crud_app;

-- Use the database
USE crud_app;

-- Create the items table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO items (name, description, price) VALUES
    ('Wireless Headphones', 'Premium noise-cancelling Bluetooth headphones with 30hr battery life', 149.99),
    ('Mechanical Keyboard', 'RGB backlit mechanical keyboard with Cherry MX switches', 89.50),
    ('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader', 45.00);
