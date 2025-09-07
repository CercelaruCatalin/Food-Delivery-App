SELECT * FROM CARTS;
SELECT * FROM CART_PRODUCTS;
SELECT * FROM CART_PRODUCT_EXTRAS;

SELECT * FROM PRODUCTS;
SELECT * FROM PRODUCT_EXTRAS;
SELECT * FROM EXTRAS;
SELECT * FROM SIZES;

SELECT * FROM CATEGORIES;
SELECT * FROM DISCOUNTS;
SELECT * FROM FAVORITES_RESTAURANTS;
SELECT * FROM ORDERS;
SELECT * FROM ORDERS_PRODUCTS;
SELECT * FROM PAYMENTS;
SELECT * FROM RESTAURANTS;
SELECT * FROM REVIEWS;


-- Table structure for table products
CREATE TABLE products (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_name VARCHAR(255) INT NOT NULL,
  description TEXT,
  price_per_item DECIMAL(10,2) NOT NULL,
  image TEXT,
  weight VARCHAR(255),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT unique_product_per_restaurant UNIQUE (restaurant_id, name)
);

ALTER TABLE products
ADD CONSTRAINT unique_product_id UNIQUE(id);

CREATE INDEX idx_products_restaurant_id ON products(restaurant_id);

--Sisez table
CREATE TABLE sizes (
  size_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INT NOT NULL,
  size_name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT unique_size_per_product UNIQUE (product_id, size_name)
);

--Extras
CREATE TABLE extras (
  extra_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  CONSTRAINT unique_extra_per_restaurant UNIQUE (restaurant_id, name)
);

CREATE TABLE product_extras (
  product_id INT NOT NULL,
  extra_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (product_id, extra_id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (extra_id) REFERENCES extras(extra_id)
);

-- Table structure for table carts
CREATE TABLE carts (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_carts_costumer_id ON carts(user_id);

-- Table structure for table carts_products

CREATE TABLE cart_products (
  cart_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 1),
  size_id INT,
  FOREIGN KEY (cart_id) REFERENCES carts(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (size_id) REFERENCES sizes(size_id)
);

ALTER TABLE cart_products
ADD COLUMN restaurant_id INT not null;

ALTER TABLE cart_products
ADD CONSTRAINT cart_products_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) 
REFERENCES restaurants(id);

CREATE TABLE cart_product_extras (
  cart_item_id INT NOT NULL,
  extra_id INT NOT NULL,
  PRIMARY KEY (cart_item_id, extra_id),
  FOREIGN KEY (cart_item_id) REFERENCES cart_products(cart_item_id),
  FOREIGN KEY (extra_id) REFERENCES extras(extra_id)
);

-- Table structure for table discounts
CREATE TABLE discounts (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INT NOT NULL,
  discount_percentage INT NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
  start_date DATE,
  end_date DATE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table structure for table restaurants
CREATE TABLE restaurants (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(255) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  postal_code VARCHAR(255) NOT NULL,
  image TEXT NOT NULL
);

ALTER TABLE restaurants
ADD COLUMN opens TIME NOT NULL DEFAULT '08:00:00',
ADD COLUMN closes TIME NOT NULL DEFAULT '22:00:00';

ALTER TABLE restaurants
ADD COLUMN categories TEXT[];

-- Actualizare categori restaurante existente
UPDATE restaurants r
SET categories = subquery.restaurant_categories
FROM (
  SELECT 
    p.restaurant_id,
    array_agg(DISTINCT c.name ORDER BY c.name) AS restaurant_categories
  FROM products p
  JOIN categories c ON p.category_name = c.name
  GROUP BY p.restaurant_id
) AS subquery
WHERE r.id = subquery.restaurant_id;

CREATE TABLE categories (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

