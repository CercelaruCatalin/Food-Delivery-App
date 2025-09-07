SELECT * FROM CARTS;
SELECT * FROM CARTS_PRODUCTS;
SELECT * FROM CATEGORIES;
SELECT * FROM DISCOUNTS;
SELECT * FROM FAVORITES_RESTAURANTS;
SELECT * FROM ORDERS;
SELECT * FROM ORDERS_PRODUCTS;
SELECT * FROM PAYMENTS;
SELECT * FROM PRODUCTS;
SELECT * FROM RESTAURANTS;
SELECT * FROM REVIEWS;
SELECT * FROM CATEGORIES


insert into categories (name)
VALUES
('burger'),
('hot dog'),
('kebab'),
('pizza'),
('salad'),
('sushi');

insert into categories (name)
VALUES
('drinks');
insert into categories (name)
VALUES
('dessert');

insert into categories (name)
VALUES
('noodles'),
('pasta'),
('pastry');

);
INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Purple-Lion',
'Strada Enrico Carusso 3',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362515/food_delivery/products/Purple-Lion/photo-1632203171982-cc0df6e9ceb4_wtunrd.jpg',
'Timisoara',
'300001');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Cheeseburger Dublu', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '2 chifle burger, seminte de susan, 2 chiftele de vita, 4 felii de cheddar, 1/2 ceapa mare taiata subtire, 2 felii de rosii, frunze de salata, maioneza, unt', 
 15.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361583/food_delivery/products/Purple-Lion/photo-1542574271-7f3b92e6c821_jlfrqt.jpg',
 '400g');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Burger Juicy Lucy', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '225g carne de vita macinata, 1 chifla hamburger, 1 felie cheddar, 15ml maioneza, 15ml ketchup, 1/4 ceapa rosie taiata subtire, 60ml salata tocata, 1/4 rosie felii, muraturi', 
 19.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362532/photo-1702709440966-0602d2e7d9d7_tvyjqu.jpg',
 '350g');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Limonada', 
 (SELECT name FROM categories WHERE name = 'drinks'),
 'limonada', 
 7.50, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741364330/photo-1617108126666-3b4f0251913a_sngebb.jpg',
 '250ml');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Suc de portocale', 
 (SELECT name FROM categories WHERE name = 'drinks'),
 'suc proaspat de portocale', 
 7.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741364395/photo-1721363005746-faf11bf9b264_wxn02r.jpg',
 '250ml');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Cheeseburger Triplu', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '450g carne de vita, 3 chifle hamburger, 6 felii cheddar, rosii felii, ceapa rosie, salata, maioneza, ketchup, mustard', 
 15.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362530/photo-1684957691800-502e754ea1e5_woyrnt.jpg',
 '1200g');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Cheeseburger Dublu Zdrobit', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '2 chifle brioche, 2 chiftele (115g fiecare), 2 felii cheddar, 60ml maioneza, 4 muraturi, ceapa rosie, felie rosie', 
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362529/photo-1678110707289-ab14382a1625_lkohzu.jpg',
 '425g');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Cheeseburger Dublu cu Bacon si Cartofi', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '2 chiftele vita, 2 chifle cu susan, 4 felii bacon, 2 felii cheddar, salata, rosii, ceapa, sos burger, cartofi prajiti, inele de ceapa', 
 32.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362513/photo-1624348755002-8f5c7f497695_fyrehc.jpg',
 '625g');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Burger Gourmet Dublu', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '2 chifle brioche, 2 chiftele vita (115g fiecare), 2 snitele pui, bacon, salata, sos, ceapa crocanta', 
 36,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362480/photo-1619250946878-4965964efe54_qhmzfm.jpg',
 '600g');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Cheeseburger Dublu Gourmet', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '2 chifle brioche, 2 chiftele vita, 2 felii cheddar, 60ml ceapa caramelizata, muraturi, sos burger', 
 30,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362366/photo-1616681936542-4346e1ad2af9_jzomfp.jpg',
 '400g');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Purple-Lion'), 
 'Meniu Burger cu Cartofi', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '1 chifteaua vita, chifla cu susan, cheddar, salata, rosii, muraturi, cartofi prajiti, salata de morcovi si porumb, sosuri', 
 33,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361715/photo-1582295523904-8ab53717447c_oebotk.jpg',
 '650g');


-- Robin-Provisions
INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Robin-Provisions',
'Strada Marasesti 10',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361615/photo-1575936950888-bd83b50a7f2d_pwb86j.jpg',
'Timisoara',
'300070');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'),
'Cheeseburger Gourmet cu Cartofi',
(SELECT name FROM categories WHERE name = 'burger'),
'Chifteaua de vita, cheddar, salata, rosie, cartofi prajiti',
11.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361598/photo-1560130803-aaadb4bc913e_acizeh.jpg',
'600g');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 
 'Corn Dog', 
 (SELECT name FROM categories WHERE name = 'hot dog'),
 '1 cana faina (240g), 1 lingurita praf de copt, sare, zahar, ou, lapte, ulei vegetal, 1 carnati', 
 11.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362925/photo-1528826134410-fd8d3f21789d_ugigbn.jpg',
 '350g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 
 'Hot Dog cu Ketchup si Arpagic', 
 (SELECT name FROM categories WHERE name = 'hot dog'),
 '2 chifle hot dog, 2 carnati, ketchup, arpagic tocata', 
 15.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362917/mateusz-feliksik-w96PYF0Uwjs-unsplash_hd40km.jpg',
 '500g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'),
'Limonada', 
(SELECT name FROM categories WHERE name = 'drinks'),
'Limonada proaspata cu gheata si menta', 
4.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741364321/photo-1555949366-819808d99159_iqwic8.jpg',
'500ml'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'),
'Chili Cheese Dog', 
(SELECT name FROM categories WHERE name = 'hot dog'),
'Hot dog cu chili, branza si ceapa verde', 
7.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362847/8-verthing-XeKYvD_ZQPI-unsplash_avuwcn.jpg',
'400g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'),
'Burger cu Inele de Ceapa', 
(SELECT name FROM categories WHERE name = 'burger'),
'Chifteaua de vita, cheddar, inele de ceapa, salata, sos burger', 
9.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362525/photo-1677825949038-9e2dea0620d0_zuoj58.jpg',
'450g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'),
'Sandvis cu Pui Crispy', 
(SELECT name FROM categories WHERE name = 'burger'),
'Piept de pui crispy, maioneza sriracha, varza, muraturi pe chifle brioche', 
10.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361772/photo-1606755962773-d324e0a13086_r3mguj.jpg',
'500g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'),
'Burger Red Velvet cu Branza', 
(SELECT name FROM categories WHERE name = 'burger'),
'Chifteaua de vita cu cheddar, busuioc si sos de branza pe chifla red velvet', 
11.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361755/photo-1596662951482-0c4ba74a6df6_nx2evp.jpg',
'500g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'),
'Burger Vegetarian Gourmet', 
(SELECT name FROM categories WHERE name = 'burger'),
'Chifteaua vegetala pe chifla croissant, cheddar, salata, cartofi condimentati', 
12.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361749/photo-1594212699903-ec8a3eca50f5_gc9v5d.jpg',
'550g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 
'Cheeseburger Juicy',
(SELECT name FROM categories WHERE name = 'burger'),
'Chifteaua de vita, cheddar, salata, rosie, sos burger',
8.99, 
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361745/photo-1586816001966-79b736744398_xnbf7f.jpg',
'450g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'),
'Cheeseburger Dublu', 
(SELECT name FROM categories WHERE name = 'burger'),
'2 chiftele de vita, cheddar, salata, rosie, muraturi', 
13.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361608/photo-1568901346375-23c9450c58cd_1_obuhzw.jpg',
'600g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'), 
'Burger cu 4 Straturi',
(SELECT name FROM categories WHERE name = 'burger'), '4 chiftele de vita, cheddar, bacon, sos barbecue',
18.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361606/photo-1564362411991-472954b39f56_hh0jmo.jpg',
'750g'),

((SELECT id FROM restaurants WHERE name = 'Robin-Provisions'),
'Cheeseburger Dublu cu Bacon si Cartofi', 
(SELECT name FROM categories WHERE name = 'burger'),
'2 chiftele de vita, cheddar, bacon, salata, rosie, cartofi prajiti', 
14.99,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361602/photo-1561758033-d89a9ad46330_cq1l9t.jpg',
'650g');

-- Loyal Saucer Eater
INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Loyal Saucer Eater',
'Strada Clabucet 11',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362516/photo-1633424234673-c8cd0f4df77b_ztdxwc.jpg',
'Timisoara',
'300145');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Bacon Cheeseburger', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '225g carne de vita, chifla brioche, cheddar, 3-4 felii bacon, rosie, salata, spanac, maioneza',
 19.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741362522/photo-1646186282205-7e419bc0c272_quz3wq.jpg',
 '500g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Trio Burger', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '3 chifle brioche, 3 chiftele vita, salata, rosii, ceapa, maioneza, branza, ceapa caramelizata, bacon, sos burger',
 29.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361941/photo-1609167830220-7164aa360951_rbzpxp.jpg',
 '750g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Cheeseburger Dublu', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '2 chifle brioche, 2 x 115g chiftele vita, 4 felii cheddar, muraturi, sos special',
 18.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361829/photo-1607013251379-e6eecfffe234_z81slk.jpg',
 '600g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Burger Picant cu Pui Triple', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '3 chifle brioche, 3 bucati pui picant, muraturi, branza, ceapa rosie, maioneza picanta, cartofi prajiti',
 24.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361770/photo-1606149059549-6042addafc5a_x9icut.jpg',
 '700g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Cheeseburger Clasic', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '115g chifteaua de vita, chifla hamburger, cheddar, rosie, ceapa rosie, muraturi, salata, maioneza, ketchup, mustard',
 14.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361768/photo-1603064752734-4c48eff53d05_zkpzvw.jpg',
 '450g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Burger de Mic dejun', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '225g carne de vita, chifla cu susan, bacon, ou, cheddar, rosie, salata, ketchup, maioneza',
 17.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361764/photo-1601894087104-0c18bc34dbd6_l6jxbk.jpg',
 '550g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Trio Burger Gourmet', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '3 chifle brioche, 3 chiftele vita, salata, rosii, ceapa, avocado, bacon, branza, inele de ceapa, cartofi prajiti', 
 27.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361753/photo-1596649299486-4cdea56fd59d_qaihnk.jpg',
 '850g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Burger cu Branza de Capra', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '3 chifle brioche, 3 chiftele vita, rosii, branza de capra, rucola, ceapa caramelizata, glazura balsamic', 
 26.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361742/photo-1585730315692-5252e57d4b40_dbxfmz.jpg',
 '850g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Burger cu Susan Negru', 
 (SELECT name FROM categories WHERE name = 'burger'),
 'Chifla cu susan negru, snitel de pui, bacon, cheddar, muraturi, maioneza, sos BBQ', 
 15.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361617/photo-1582196016295-f8c8bd4b3a99_xyaigj.jpg',
 '450g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Burger cu Pui Crispy si Cartofi', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '2 chifle cu susan, 2 snitele pui crispy, cheddar, salata, rosie, maioneza, cartofi prajiti', 
 17.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361595/photo-1551782450-a2132b4ba21d_wwk2lu.jpg',
 '600g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Burger cu Avocado', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '2 chiftele vita, 2 chifle cu susan, avocado, maioneza, spanac, felii de ridiche', 
 20.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361593/photo-1550547660-d9450f859349_dthfaj.jpg',
 '550g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Burger cu Bacon si Ou', 
 (SELECT name FROM categories WHERE name = 'burger'),
 '225g carne de vita, chifla cu susan, bacon, ou, rosie, muraturi, salata, mustard', 
 19.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361590/photo-1550317138-10000687a72b_koevkn.jpg',
 '500g'),

((SELECT id FROM restaurants WHERE name = 'Loyal Saucer Eater'), 
 'Burger cu Ciuperci si Branza', 
 (SELECT name FROM categories WHERE name = 'burger'),
 'Chifla brioche cu susan, 225g carne de vita, branza Elvetiana, ceapa caramelizata, ciuperci, rosii uscate, salata', 
 21.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1741361588/photo-1549611016-3a70d82b5040_bwahyd.jpg',
 '550g');


