SELECT * FROM CARTS;
SELECT * FROM CART_PRODUCTS;
SELECT * FROM CATEGORIES;
SELECT * FROM DISCOUNTS;
SELECT * FROM FAVORITES_RESTAURANTS;
SELECT * FROM ORDERS;
SELECT * FROM ORDERS_PRODUCTS;
SELECT * FROM PAYMENTS;
SELECT * FROM PRODUCTS;
SELECT * FROM RESTAURANTS;
SELECT * FROM REVIEWS;

SELECT * FROM users;
SELECT * FROM accounts;
SELECT * FROM sessions;
SELECT * FROM verification_token;

-- Table structure for table reviews
CREATE TABLE reviews (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id INT NOT NULL,
  user_id INT NOT NULL,
  grade INT NOT NULL CHECK (grade BETWEEN 1 AND 5),
  review_text TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);

-- Table structure for table favorites_restaurants
CREATE TABLE favorites_restaurants (
  restaurant_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (restaurant_id, user_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table structure for table payments(Stripe)
CREATE TABLE payments (
  id VARCHAR(255) PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(20) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- No ON UPDATE clause
);

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_update_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_payments_updated_at();

--Next auth
CREATE TABLE verification_token
(
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
 
  PRIMARY KEY (identifier, token)
);
 
CREATE TABLE accounts
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
 
  PRIMARY KEY (id)
);
 
CREATE TABLE sessions
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,
 
  PRIMARY KEY (id)
);
 
CREATE TABLE users
(
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  password VARCHAR(255),
  phone_number VARCHAR(20),
  city varchar(255),
  street_address VARCHAR(255),
  postal_code VARCHAR(255),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_products_category_name ON products(category_name);
CREATE INDEX idx_orders_products_product_id ON orders_products(id);
 
 
