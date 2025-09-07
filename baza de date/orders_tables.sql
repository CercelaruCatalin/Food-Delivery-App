
SELECT * FROM USERS;
SELECT * FROM SESSIONS;
SELECT * FROM ACCOUNTS;

SELECT * FROM ORDERS;
SELECT * FROM ORDERS_PRODUCTS;
SELECT * FROM ORDERS_PRODUCTS_EXTRAS;

SELECT * FROM GUEST_ORDERS;

SELECT * FROM CATEGORIES;
SELECT * FROM PRODUCTS;

SELECT * FROM RESTAURANTS;

DELETE FROM orders_products_extras;
DELETE FROM orders_products;
DELETE FROM guest_orders;
DELETE FROM orders;
DELETE FROM guest_orders;

-- Table structure for table orders
CREATE TABLE orders (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_status VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE ORDERS
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN city VARCHAR(255),
ADD COLUMN street_address VARCHAR(255),
ADD COLUMN postal_code VARCHAR(255);

ALTER TABLE orders
  ADD COLUMN delivery_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE ORDERS
ADD COLUMN delivery_status VARCHAR(100) DEFAULT 'Order received';

ALTER TABlE ORDERS
ADD COLUMN courier_id int;


CREATE TABLE guest_orders (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_method VARCHAR(50) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_status VARCHAR(50),
  phone_number VARCHAR(20) NOT NULL,
  city VARCHAR(255) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  postal_code VARCHAR(255)NOT NULL
);

ALTER TABLE guest_orders
  ADD COLUMN delivery_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE GUEST_ORDERS
ADD COLUMN delivery_status VARCHAR(100) DEFAULT 'Order received';

ALTER TABlE GUEST_ORDERS
ADD COLUMN courier_id int;

ALTER TABLE GUEST_ORDERS
ADD COLUMN guest_user_id int not null;

TRUNCATE orders_products_extras, orders_products, guest_orders RESTART IDENTITY CASCADE;

Delete from orders;


-- Table structure for table orders_products
CREATE TABLE orders_products (
  order_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT,
  product_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 1),
  size_id INT,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (size_id) REFERENCES sizes(size_id)
);

-- First, modify the table to handle both order types
ALTER TABLE orders_products 
ADD COLUMN guest_order_id INT,
ADD CONSTRAINT orders_products_guest_order_id_fkey 
    FOREIGN KEY (guest_order_id) 
    REFERENCES guest_orders(id),
ADD CONSTRAINT chk_order_type CHECK (
    (order_id IS NOT NULL AND guest_order_id IS NULL) OR
    (order_id IS NULL AND guest_order_id IS NOT NULL)
);


CREATE TABLE orders_products_extras (
  order_item_id INT NOT NULL,
  extra_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 1),
  PRIMARY KEY (order_item_id, extra_id),
  FOREIGN KEY (extra_id) REFERENCES extras(extra_id)
);

-- Fix the foreign key reference in orders_products_extras table
ALTER TABLE orders_products_extras 
ADD CONSTRAINT orders_products_extras_order_item_id_fkey 
FOREIGN KEY (order_item_id) 
REFERENCES orders_products(order_item_id);

ALTER TABLE orders 
ADD COLUMN payment_intent_id VARCHAR(255);

ALTER TABLE guest_orders 
ADD COLUMN payment_intent_id VARCHAR(255);

-- Index pentru cautari rapide
CREATE INDEX idx_orders_payment_intent ON orders(payment_intent_id);

ALTER TABLE orders 
ADD COLUMN courier_status VARCHAR(100);

ALTER TABLE guest_orders 
ADD COLUMN courier_status VARCHAR(100);