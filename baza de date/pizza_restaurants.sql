SELECT * FROM restaurants;
SELECT * FROM categories;

SELECT * FROM PRODUCTS;
SELECT * FROM PRODUCT_EXTRAS;
SELECT * FROM EXTRAS;
SELECT * FROM SIZES;

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Grazie Ragazzi Pizza',
 'Piața Alexandru Mocioni 7',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659858/banner-photo_otxk6g.jpg',
 'timisoara',
 '300173');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Deluxe Meat Lovers Pizza',
 'pizza',
 'Pizza deluxe pentru iubitorii de carne, preparata cu aluat de pizza, sos de pizza, mozzarella, pepperoni, salami, ciuperci, rosii si masline negre.',
 18.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659818/photo-1700760934249-93efbb574d23_fekqag.avif',
 '500g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'BBQ Chicken Pizza',
 'pizza',
 'Pizza cu pui la BBQ, preparata cu aluat de pizza, sos de pizza, mozzarella, piept de pui gatit, sos BBQ si rucola.',
 17.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659909/photo-1662805525084-79fd48e09e0b_bta5ee.avif',
 '480g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Deluxe Peperoni Pizza',
 'pizza',
 'Pizza deluxe cu pepperoni, preparata cu aluat de pizza, sos de pizza, mozzarella, pepperoni, sunca, ciuperci, ceapa rosie si porumb dulce.',
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659905/photo-1655673654158-9f7285b7d1ea_iud2aq.avif',
 '500g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Vegetarian Pizza',
 'pizza',
 'Pizza vegetariana, preparata cu aluat de pizza, sos de pizza, mozzarella, ardei rosu si verde, ulei de masline, sare si piper.',
 15.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659902/photo-1637217423028-25a89722c380_rcxgwj.avif',
 '450g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Deluxe Corn and Olive Pizza',
 'pizza',
 'Pizza deluxe cu porumb si masline, preparata cu aluat de pizza, sos de pizza, mozzarella, pepperoni, ardei, masline negre si porumb dulce.',
 17.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659897/photo-1633040248073-9a31468f7e99_h4ywmp.avif',
 '500g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Meat Lovers Pizza',
 'pizza',
 'Pizza pentru iubitorii de carne, preparata cu aluat de pizza, sos de pizza, mozzarella, pepperoni, sunca, salami si carne tocata de vita.',
 18.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659894/photo-1628840042765-356cda07504e_iedemk.avif',
 '520g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Margherita Pizza',
 'pizza',
 'Pizza clasica Margherita, preparata cu aluat de pizza, sos de rosii, mozzarella proaspata si busuioc, asezonata cu ulei de masline, sare si piper.',
 14.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659890/photo-1627626775846-122b778965ae_imv7ew.avif',
 '400g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Goat Cheese, Walnut, and Sundried Tomato Pizza',
 'pizza',
 'Pizza sofisticata cu branza de capra, nuci si rosii uscate, preparata cu aluat de pizza, sos de pizza, branza de capra, nuci, rosii uscate si busuioc.',
 19.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659887/photo-1627461985459-51600559fffe_ftd1dd.avif',
 '450g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Veggie Supreme Pizza',
 'pizza',
 'Pizza Veggie Supreme, preparata cu aluat de pizza, sos de pizza, mozzarella, ceapa, ardei, ciuperci, jalapenos, masline negre, porumb si rosii proaspete.',
 16.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659883/photo-1625401514458-6c8a5e7d55da_j8erog.avif',
 '500g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Two Pizzas: Ham & Cheese and Mushroom & Sausage',
 'pizza',
 'Doua pizza intr-o singura comanda: una cu sunca si branza si alta cu ciuperci si carnati, preparate cu aluat de pizza, sos si mozzarella.',
 20.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659880/photo-1621998257812-20849f2491f3_eaw0zx.avif',
 '550g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Two-Topping Pizza with Leafy Greens',
 'pizza',
 'Pizza cu doua toppinguri: rosii cherry si verdeata, preparata cu aluat de pizza, sos de pizza, mozzarella, rosii cherry si verdeata amestecata.',
 15.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659873/photo-1618417789450-7c6a5fa113e9_rhlhgt.avif',
 '430g'),

-- 12
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Pepperoni & Feta Pizza',
 'pizza',
 'Pizza cu pepperoni si feta, preparata cu aluat de pizza, sos, mozzarella, pepperoni, feta si condimentata cu amestec de seminte si miere.',
 17.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659870/photo-1618414466217-34f57f16c354_w3vjj1.avif',
 '450g'),

-- 13
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Mediterranean Chicken Pizza',
 'pizza',
 'Pizza mediteraneana cu pui, preparata cu aluat de pizza, sos de pizza, mozzarella, pui gatit, masline negre, rosii, ardei si dressing din maioneza sau tahini.',
 18.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659867/photo-1618213837799-25d5552820d3_jmt1zz.avif',
 '500g'),

-- 14
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'),
 'Refreshing Lemonade Mint',
 'drinks',
 'Limonada racoritoare cu menta, preparata din apa, zahar, suc de lamaie si frunze proaspete de menta, servita cu gheata.',
 4.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659864/photo-1575596510825-f748919a2bf7_ysdlsn.avif',
 '350ml');


 INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('The Pizza President',
 'Piața Alexandru Mocioni 6',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659924/banner-photo_xodb0w.jpg',
 'timisoara',
 '300199');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Pepperoni, Ham, and Green Pepper Pizza',
 'pizza',
 'Pizza cu pepperoni, sunca si ardei verde, preparata cu aluat de pizza, sos de pizza, mozzarella, ceapa rosie, ulei de masline si busuioc.',
 17.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659920/photo-1617424771170-d333ef3d93d8_vsd8uq.avif',
 '500g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Roasted Potato, Sausage, and Spinach Pizza',
 'pizza',
 'Pizza cu cartofi copti, carnati si spanac, preparata cu aluat de pizza, sos de pizza, mozzarella, cartofi felii subtiri, carnati, spanac proaspat si ceapa rosie.',
 18.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659969/photo-1617219474299-b17c6a43834d_lbzvj1.avif',
 '520g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Salami and Olive Pizza',
 'pizza',
 'Pizza cu salami si masline, preparata cu aluat de pizza, sos de pizza, mozzarella, salami si masline negre.',
 16.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659966/photo-1616028678351-3882f0aa88d7_oummra.avif',
 '480g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Chicken Pasta Pizza',
 'pizza',
 'Pizza cu pui si paste, preparata cu aluat de pizza, sos de pizza, mozzarella, pui gatit, paste penne, ardei colorat si condimente.',
 18.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659962/photo-1615719413546-198b25453f85_odlf8k.avif',
 '500g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Veggie & Sausage Pizza',
 'pizza',
 'Pizza cu legume si carnati, preparata cu aluat de pizza, sos de pizza, mozzarella, pepperoni, ciuperci, ardei verde si masline negre, cu usturoi si condimente.',
 17.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659958/photo-1604382354936-07c5d9983bd3_f7xaf7.avif',
 '510g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Margherita Pizza',
 'pizza',
 'Pizza Margherita clasica, preparata cu aluat de pizza, sos de rosii, mozzarella proaspata, busuioc, ulei de masline, sare si piper.',
 15.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659954/photo-1604068549290-dea0e4a305ca_h2wy8c.avif',
 '450g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Pepperoni and Red Onion Pizza',
 'pizza',
 'Pizza cu pepperoni si ceapa rosie, preparata cu aluat de pizza, sos de pizza, mozzarella, pepperoni, ceapa rosie, capere si ulei de masline.',
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659951/photo-1602658015057-c17cd1f324f4_q3uu3g.avif',
 '480g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Hawaiian Pizza',
 'pizza',
 'Pizza Hawaiian, preparata cu aluat de pizza, sos de pizza, mozzarella, sunca si ananas, cu o combinatie dulce si sarata.',
 17.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659948/photo-1597715469889-dd75fe4a1765_xmyy4h.avif',
 '500g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Roasted Vegetable and Burrata Pizza',
 'pizza',
 'Pizza cu legume coapte si burrata, preparata cu aluat de pizza, sos de pizza, zucchini, ardei, rosii cherry si burrata, asezonata cu ulei de masline.',
 19.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659944/photo-1596818532151-94f23db18997_lo2zco.avif',
 '520g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Chicken and Green Pepper Pizza',
 'pizza',
 'Pizza cu pui si ardei verde, preparata cu aluat de pizza, sos de pizza, mozzarella, pui gatit, ardei verde, oregano si usturoi.',
 18.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659940/photo-1595357081381-c34f5634adef_cjz74q.avif',
 '500g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Supreme Pizza',
 'pizza',
 'Pizza Supreme, cu pui, vita, sunca, ciuperci, ardei si ceapa, preparata cu aluat de pizza, sos de pizza, mozzarella si seminte de susan.',
 20.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659937/photo-1593246049226-ded77bf90326_ub6eac.avif',
 '550g'),

-- 12
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Pepperoni and Jalapeno Pizza',
 'pizza',
 'Pizza picanta cu pepperoni si jalapeno, preparata cu aluat de pizza, sos de pizza, mozzarella, pepperoni, jalapeno si ceapa rosie.',
 17.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659934/photo-1590534247856-1e343c738d02_fhatto.avif',
 '480g'),

-- 13
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Pepperoni and Caramelized Onion Pizza',
 'pizza',
 'Pizza cu pepperoni si ceapa caramelizata, preparata cu aluat de pizza, sos de pizza, mozzarella, pepperoni, ceapa galbena caramelizata si ulei de masline.',
 18.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659930/photo-1589477500339-82aeb8718167_nc6u7d.avif',
 '500g'),

-- 14
((SELECT id FROM restaurants WHERE name = 'The Pizza President'),
 'Rosemary Potato Pizza',
 'pizza',
 'Pizza cu cartofi si rozmarin, preparata pe tortilla mare, cu cartofi felii subtiri, mozzarella, ulei de masline si rozmarin proaspat.',
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659927/photo-1588170737136-c5f83da1321a_dbsyge.avif',
 '450g');
