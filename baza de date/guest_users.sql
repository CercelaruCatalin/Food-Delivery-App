SELECT * FROM guest_users;
SELECT * FROM guest_orders;
SELECT * FROM RESTAURANTS;

CREATE TABLE guest_users
(
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id)
);

CREATE INDEX idx_guest_email ON guest_users(email);