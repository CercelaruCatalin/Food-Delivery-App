SELECT * FROM COURIER_LOCATIONS;
SELECT * FROM COURIERS;
SELECT * FROM USERS;
SELECT * FROM GUEST_USERS;
SELECT * FROM GUEST_ORDERS;

-- Pozitiile curierilor
CREATE TABLE courier_locations (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL,
  courier_id INT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);



ALTER TABLE courier_locations
ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

CREATE INDEX idx_courier_locations_order_id ON courier_locations(order_id);
CREATE INDEX idx_courier_locations_timestamp ON courier_locations(timestamp);

-- Tabel pentru curierii
CREATE TABLE couriers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE couriers 
ADD COLUMN password VARCHAR(255) NOT NULL;

ALTER TABLE courier_locations 
ADD COLUMN accuracy DECIMAL(10, 2),  -- Precizia GPS in metri
ADD COLUMN speed DECIMAL(10, 2);     -- Viteza in m/s sau km/h

CREATE INDEX idx_courier_locations_speed ON courier_locations(speed);

ALTER TABLE courier_locations 
ADD COLUMN order_type VARCHAR(10) NOT NULL DEFAULT 'user';

-- Add index for better performance
CREATE INDEX idx_courier_locations_order_type ON courier_locations(order_type, order_id, courier_id);

-- coordonate pentru restaurante
ALTER TABLE restaurants 
ADD COLUMN latitude DECIMAL(10, 7),
ADD COLUMN longitude DECIMAL(10, 7);

-- courier_id la orders
ALTER TABLE orders 
ADD COLUMN courier_id INT,
ADD FOREIGN KEY (courier_id) REFERENCES couriers(id);

-- coordonate pentru utilizatori
ALTER TABLE users 
ADD COLUMN latitude DECIMAL(10, 7),
ADD COLUMN longitude DECIMAL(10, 7);

Delete from courier_locations;
