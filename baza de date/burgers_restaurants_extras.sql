SELECT * FROM CARTS;
SELECT * FROM CARTS_PRODUCTS;
SELECT * FROM CART_PRODUCT_EXTRAS;

SELECT * FROM PRODUCTS;
SELECT * FROM PRODUCT_EXTRAS;
SELECT * FROM EXTRAS;
SELECT * FROM SIZES;

-- Extras pentru Purple-Lion
INSERT INTO extras (restaurant_id, name)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 'Brânză Cheddar Extra'),
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 'Bacon Crocant'),
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 'Ceapă Caramelizată'),
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 'Sos Burger Extra'),
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 'Muraturi Extra'),
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 'Chiftea de Vită Suplimentară');

-- Extras pentru Robin-Provisions
INSERT INTO extras (restaurant_id, name)
VALUES
((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 'Brânză Cheddar Extra'),
((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 'Bacon Crocant'),
((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 'Sos Sriracha'),
((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 'Inele de Ceapă'),
((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 'Cartofi Condimentați'),
((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 'Sos Barbecue');

-- Extras pentru Loyal Saucer Eater
INSERT INTO extras (restaurant_id, name)
VALUES
((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 'Brânză Cheddar Extra'),
((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 'Bacon Crocant'),
((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 'Avocado'),
((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 'Ou Prăjit'),
((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 'Ciuperci Sotate'),
((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 'Brânză de Capră');

-- Acum să asociem extras-urile cu produsele și să setăm prețurile
-- Asociere extras pentru produsele Purple-Lion

-- Pentru Cheeseburger Dublu
INSERT INTO product_extras (product_id, extra_id, price)
VALUES
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Purple-Lion' AND p.name = 'Cheeseburger Dublu'),
 (SELECT extra_id FROM extras WHERE name = 'Brânză Cheddar Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Purple-Lion')),
 3.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Purple-Lion' AND p.name = 'Cheeseburger Dublu'),
 (SELECT extra_id FROM extras WHERE name = 'Bacon Crocant' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Purple-Lion')),
 4.00),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Purple-Lion' AND p.name = 'Cheeseburger Dublu'),
 (SELECT extra_id FROM extras WHERE name = 'Sos Burger Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Purple-Lion')),
 1.50);

-- Pentru Burger Juicy Lucy
INSERT INTO product_extras (product_id, extra_id, price)
VALUES
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Purple-Lion' AND p.name = 'Burger Juicy Lucy'),
 (SELECT extra_id FROM extras WHERE name = 'Brânză Cheddar Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Purple-Lion')),
 3.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Purple-Lion' AND p.name = 'Burger Juicy Lucy'),
 (SELECT extra_id FROM extras WHERE name = 'Ceapă Caramelizată' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Purple-Lion')),
 2.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Purple-Lion' AND p.name = 'Burger Juicy Lucy'),
 (SELECT extra_id FROM extras WHERE name = 'Muraturi Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Purple-Lion')),
 1.50);

-- Pentru Cheeseburger Triplu
INSERT INTO product_extras (product_id, extra_id, price)
VALUES
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Purple-Lion' AND p.name = 'Cheeseburger Triplu'),
 (SELECT extra_id FROM extras WHERE name = 'Brânză Cheddar Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Purple-Lion')),
 3.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Purple-Lion' AND p.name = 'Cheeseburger Triplu'),
 (SELECT extra_id FROM extras WHERE name = 'Chiftea de Vită Suplimentară' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Purple-Lion')),
 7.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Purple-Lion' AND p.name = 'Cheeseburger Triplu'),
 (SELECT extra_id FROM extras WHERE name = 'Bacon Crocant' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Purple-Lion')),
 4.00);

-- Asociere extras pentru produsele Robin-Provisions

-- Pentru Cheeseburger Gourmet cu Cartofi
INSERT INTO product_extras (product_id, extra_id, price)
VALUES
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Robin-Provisions' AND p.name = 'Cheeseburger Gourmet cu Cartofi'),
 (SELECT extra_id FROM extras WHERE name = 'Brânză Cheddar Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Robin-Provisions')),
 3.00),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Robin-Provisions' AND p.name = 'Cheeseburger Gourmet cu Cartofi'),
 (SELECT extra_id FROM extras WHERE name = 'Bacon Crocant' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Robin-Provisions')),
 3.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Robin-Provisions' AND p.name = 'Cheeseburger Gourmet cu Cartofi'),
 (SELECT extra_id FROM extras WHERE name = 'Cartofi Condimentați' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Robin-Provisions')),
 4.00);

-- Pentru Chili Cheese Dog
INSERT INTO product_extras (product_id, extra_id, price)
VALUES
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Robin-Provisions' AND p.name = 'Chili Cheese Dog'),
 (SELECT extra_id FROM extras WHERE name = 'Brânză Cheddar Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Robin-Provisions')),
 2.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Robin-Provisions' AND p.name = 'Chili Cheese Dog'),
 (SELECT extra_id FROM extras WHERE name = 'Sos Sriracha' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Robin-Provisions')),
 1.50);

-- Pentru Burger Vegetarian Gourmet
INSERT INTO product_extras (product_id, extra_id, price)
VALUES
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Robin-Provisions' AND p.name = 'Burger Vegetarian Gourmet'),
 (SELECT extra_id FROM extras WHERE name = 'Brânză Cheddar Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Robin-Provisions')),
 3.00),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Robin-Provisions' AND p.name = 'Burger Vegetarian Gourmet'),
 (SELECT extra_id FROM extras WHERE name = 'Inele de Ceapă' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Robin-Provisions')),
 3.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Robin-Provisions' AND p.name = 'Burger Vegetarian Gourmet'),
 (SELECT extra_id FROM extras WHERE name = 'Sos Barbecue' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Robin-Provisions')),
 1.50);

-- Asociere extras pentru produsele Loyal Saucer Eater

-- Pentru Bacon Cheeseburger
INSERT INTO product_extras (product_id, extra_id, price)
VALUES
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Loyal Saucer Eater' AND p.name = 'Bacon Cheeseburger'),
 (SELECT extra_id FROM extras WHERE name = 'Brânză Cheddar Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater')),
 3.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Loyal Saucer Eater' AND p.name = 'Bacon Cheeseburger'),
 (SELECT extra_id FROM extras WHERE name = 'Bacon Crocant' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater')),
 4.00),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Loyal Saucer Eater' AND p.name = 'Bacon Cheeseburger'),
 (SELECT extra_id FROM extras WHERE name = 'Ou Prăjit' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater')),
 3.00);

-- Pentru Burger cu Branza de Capra
INSERT INTO product_extras (product_id, extra_id, price)
VALUES
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Loyal Saucer Eater' AND p.name = 'Burger cu Branza de Capra'),
 (SELECT extra_id FROM extras WHERE name = 'Brânză de Capră' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater')),
 5.00),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Loyal Saucer Eater' AND p.name = 'Burger cu Branza de Capra'),
 (SELECT extra_id FROM extras WHERE name = 'Ciuperci Sotate' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater')),
 3.50);

-- Pentru Burger cu Avocado
INSERT INTO product_extras (product_id, extra_id, price)
VALUES
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Loyal Saucer Eater' AND p.name = 'Burger cu Avocado'),
 (SELECT extra_id FROM extras WHERE name = 'Avocado' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater')),
 4.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Loyal Saucer Eater' AND p.name = 'Burger cu Avocado'),
 (SELECT extra_id FROM extras WHERE name = 'Brânză Cheddar Extra' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater')),
 3.50),
 
((SELECT p.id FROM products p JOIN restaurants r ON p.restaurant_id = r.id WHERE r.name = 'Loyal Saucer Eater' AND p.name = 'Burger cu Avocado'),
 (SELECT extra_id FROM extras WHERE name = 'Bacon Crocant' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater')),
 4.00);